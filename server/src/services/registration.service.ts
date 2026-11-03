import { prisma } from '../config/db.js';
import { Prisma } from '@prisma/client';
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
  // In-memory cache for active event to avoid repeated DB lookups under high concurrency
  private cachedEvent: {
    data: any;
    expiresAt: number;
  } | null = null;

  private async getActiveEvent() {
    const now = Date.now();
    if (this.cachedEvent && this.cachedEvent.expiresAt > now) {
      return this.cachedEvent.data;
    }

    let activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
    });

    // Auto-heal / self-bootstrap if no event is currently marked active
    if (!activeEvent) {
      const anyEvent = await prisma.event.findFirst({
        orderBy: { year: 'desc' },
      });

      if (anyEvent) {
        activeEvent = await prisma.event.update({
          where: { id: anyEvent.id },
          data: { isActive: true },
        });
      } else {
        activeEvent = await prisma.event.upsert({
          where: { id: 'jecrc-diwali-2026-main-event' },
          update: { isActive: true },
          create: {
            id: 'jecrc-diwali-2026-main-event',
            name: 'JECRC University Alumni Diwali Get-Together 2026',
            year: 2026,
            eventDate: new Date('2026-11-04T05:30:00.000Z'),
            venue: 'JECRC University Campus, Ramchandrapura, Sitapura, Jaipur (Entry from Gate 01 - Main Gate)',
            isActive: true,
          },
        });
      }
    }

    if (activeEvent) {
      this.cachedEvent = {
        data: activeEvent,
        expiresAt: now + 5 * 60 * 1000, // 5 minutes TTL
      };
    }

    return activeEvent;
  }

  /**
   * Register a new alumnus for the active Diwali event.
   */
  async registerAlumni(input: AlumniRegistrationInput) {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedMobile = normalizeMobile(input.mobile);

    // 1. Get active event (cached for performance)
    const activeEvent = await this.getActiveEvent();

    if (!activeEvent) {
      throw new Error('No active Diwali event found for registration.');
    }

    // 2. Check for duplicate registration by email or mobile in a SINGLE optimized query
    const existingRegistration = await prisma.alumniRegistration.findFirst({
      where: {
        OR: [
          { normalizedEmail },
          { normalizedMobile },
        ],
      },
      select: {
        normalizedEmail: true,
        normalizedMobile: true,
      },
    });

    if (existingRegistration) {
      if (existingRegistration.normalizedEmail === normalizedEmail) {
        const err = new Error('An alumnus with this email address is already registered.');
        (err as any).statusCode = 409;
        throw err;
      }
      if (existingRegistration.normalizedMobile === normalizedMobile) {
        const err = new Error('An alumnus with this mobile number is already registered.');
        (err as any).statusCode = 409;
        throw err;
      }
    }

    // 3. Generate secure random QR token and compute SHA-256 hash
    const rawToken = generateSecureToken();
    const qrTokenHash = hashQrToken(rawToken);

    // 4. Save registration in database with atomic registration ID and collision safety
    let registration: any = null;
    let attempts = 0;

    while (attempts < 3) {
      try {
        const registrationId = await generateRegistrationId(activeEvent.year);
        registration = await prisma.alumniRegistration.create({
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
            games: input.games && input.games.length > 0 ? input.games : [],
            qrTokenHash,
            eventId: activeEvent.id,
          },
        });
        break;
      } catch (err: any) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          Array.isArray(err.meta?.target) &&
          err.meta.target.includes('registrationId')
        ) {
          attempts++;
          await new Promise((r) => setTimeout(r, 10 + Math.random() * 20));
          continue;
        }
        throw err;
      }
    }

    if (!registration) {
      throw new Error('Failed to generate a unique registration record. Please retry.');
    }

    // 5. Generate verification URL and QR code image (high-res data URL)
    const qrPayload = buildQrPayload(rawToken);
    const qrCodeDataUrl = await generateQrDataUrl(qrPayload);

    // 6. Return confirmation details along with QR Code
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
      games: registration.games,
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
      games: registration.games,
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
