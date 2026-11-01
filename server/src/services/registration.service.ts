import { prisma } from '../config/db.js';
import { AlumniRegistrationInput } from '../validators/registration.validator.js';
import {
  generateSecureToken,
  hashQrToken,
  normalizeEmail,
  normalizeMobile,
} from '../utils/crypto.js';
import { generateRegistrationId } from '../utils/idGenerator.js';
import { buildQrPayload, generateQrDataUrl } from '../utils/qrGenerator.js';

export class RegistrationService {
  /**
   * Register a new alumnus for the active Diwali event.
   */
  async registerAlumni(input: AlumniRegistrationInput) {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedMobile = normalizeMobile(input.mobile);

    // 1. Get active event
    const activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
    });

    if (!activeEvent) {
      throw new Error('No active Diwali event found for registration.');
    }

    // 2. Check for duplicate registration by email
    const existingEmail = await prisma.alumniRegistration.findUnique({
      where: { normalizedEmail },
    });
    if (existingEmail) {
      const err = new Error('An alumnus with this email address is already registered.');
      (err as any).statusCode = 409;
      throw err;
    }

    // 3. Check for duplicate registration by mobile
    const existingMobile = await prisma.alumniRegistration.findUnique({
      where: { normalizedMobile },
    });
    if (existingMobile) {
      const err = new Error('An alumnus with this mobile number is already registered.');
      (err as any).statusCode = 409;
      throw err;
    }

    // 4. Generate unique registration ID safely
    const registrationId = await generateRegistrationId(activeEvent.year);

    // 5. Generate secure random QR token and compute SHA-256 hash
    const rawToken = generateSecureToken();
    const qrTokenHash = hashQrToken(rawToken);

    // 6. Save registration in database
    const registration = await prisma.alumniRegistration.create({
      data: {
        registrationId,
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        normalizedEmail,
        mobile: input.mobile.trim(),
        normalizedMobile,
        currentCity: input.currentCity?.trim() || null,
        graduationYear: input.graduationYear,
        degree: input.degree.trim(),
        course: input.course.trim(),
        otherDegree: input.otherDegree?.trim() || null,
        otherCourse: input.otherCourse?.trim() || null,
        branch: (input.branch?.trim() || input.course.trim()),
        companyName: input.companyName.trim(),
        designation: input.designation.trim(),
        qrTokenHash,
        eventId: activeEvent.id,
      },
    });

    // 7. Generate verification URL and QR code image (high-res data URL)
    const qrPayload = buildQrPayload(rawToken);
    const qrCodeDataUrl = await generateQrDataUrl(qrPayload);

    // 8. Return confirmation details along with QR Code
    // Raw token is NEVER persisted in DB; only returned once in confirmation response for rendering pass
    return {
      registrationId: registration.registrationId,
      fullName: registration.fullName,
      email: registration.email,
      mobile: registration.mobile,
      currentCity: registration.currentCity,
      graduationYear: registration.graduationYear,
      degree: registration.degree,
      course: registration.course,
      otherDegree: registration.otherDegree,
      otherCourse: registration.otherCourse,
      branch: registration.branch,
      companyName: registration.companyName,
      designation: registration.designation,
      createdAt: registration.createdAt,
      eventName: activeEvent.name,
      eventYear: activeEvent.year,
      venue: activeEvent.venue,
      eventDate: activeEvent.eventDate,
      qrCodeDataUrl,
    };
  }

  /**
   * Safe public lookup of registration details by registration ID.
   * Does NOT return raw token or token hash.
   */
  async getRegistrationById(registrationId: string) {
    const registration = await prisma.alumniRegistration.findUnique({
      where: { registrationId: registrationId.trim().toUpperCase() },
      include: {
        event: {
          select: {
            name: true,
            year: true,
            venue: true,
            eventDate: true,
          },
        },
        checkIn: {
          select: {
            checkedInAt: true,
            gateName: true,
          },
        },
      },
    });

    if (!registration) {
      return null;
    }

    return {
      registrationId: registration.registrationId,
      fullName: registration.fullName,
      email: registration.email,
      mobile: registration.mobile,
      currentCity: registration.currentCity,
      graduationYear: registration.graduationYear,
      degree: registration.degree,
      course: registration.course,
      otherDegree: registration.otherDegree,
      otherCourse: registration.otherCourse,
      branch: registration.branch,
      companyName: registration.companyName,
      designation: registration.designation,
      createdAt: registration.createdAt,
      eventName: registration.event.name,
      eventYear: registration.event.year,
      venue: registration.event.venue,
      eventDate: registration.event.eventDate,
      isCheckedIn: !!registration.checkIn,
      checkedInAt: registration.checkIn?.checkedInAt ?? null,
    };
  }
}

export const registrationService = new RegistrationService();
