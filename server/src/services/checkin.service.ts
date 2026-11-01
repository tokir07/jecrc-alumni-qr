import { prisma } from '../config/db.js';
import { hashQrToken } from '../utils/crypto.js';
import { VerificationResponse } from '../types/index.js';
import { Prisma } from '@prisma/client';

export class CheckInService {
  /**
   * Verify QR token and record check-in atomically.
   */
  async verifyAndCheckIn(
    tokenPayload: string,
    checkedInBy: string,
    gateName = 'Gate 01 (Main Gate)'
  ): Promise<VerificationResponse> {
    const tokenHash = hashQrToken(tokenPayload);

    // 1. Look up registration by hash
    const registration = await prisma.alumniRegistration.findUnique({
      where: { qrTokenHash: tokenHash },
      include: {
        checkIn: true,
        event: true,
      },
    });

    // Case 3: Invalid QR Code
    if (!registration) {
      return {
        status: 'INVALID',
        message: 'No valid registration found. Please contact the registration desk.',
      };
    }

    // Case 2: Already Checked In (Duplicate Entry Attempt)
    if (registration.checkIn) {
      return {
        status: 'ALREADY_CHECKED_IN',
        message: 'This QR code has already been used for entry.',
        alumni: {
          fullName: registration.fullName,
          registrationId: registration.registrationId,
          graduationYear: registration.graduationYear,
          degree: registration.degree,
          course: registration.course,
          otherDegree: registration.otherDegree,
          otherCourse: registration.otherCourse,
          branch: registration.branch,
          companyName: registration.companyName,
          designation: registration.designation,
          currentCity: registration.currentCity,
        },
        checkedInAt: registration.checkIn.checkedInAt.toISOString(),
        checkedInBy: registration.checkIn.checkedInBy,
        gateName: registration.checkIn.gateName,
      };
    }

    // Case 1: First-time entry (Record check-in atomically with Prisma transaction)
    try {
      const checkInRecord = await prisma.$transaction(async (tx) => {
        // Double check within transaction
        const existingCheckIn = await tx.checkIn.findUnique({
          where: { alumniRegistrationId: registration.id },
        });

        if (existingCheckIn) {
          throw new Error('DUPLICATE_CHECKIN_DETECTED');
        }

        return tx.checkIn.create({
          data: {
            alumniRegistrationId: registration.id,
            checkedInAt: new Date(),
            checkedInBy,
            gateName,
          },
        });
      });

      return {
        status: 'SUCCESS',
        message: 'Entry approved. Welcome Back! Enjoy the Diwali Get-Together.',
        alumni: {
          fullName: registration.fullName,
          registrationId: registration.registrationId,
          graduationYear: registration.graduationYear,
          degree: registration.degree,
          course: registration.course,
          otherDegree: registration.otherDegree,
          otherCourse: registration.otherCourse,
          branch: registration.branch,
          companyName: registration.companyName,
          designation: registration.designation,
          currentCity: registration.currentCity,
        },
        checkedInAt: checkInRecord.checkedInAt.toISOString(),
        checkedInBy: checkInRecord.checkedInBy,
        gateName: checkInRecord.gateName,
      };
    } catch (err: any) {
      // Handle race condition caught by unique constraint or check
      if (
        err.message === 'DUPLICATE_CHECKIN_DETECTED' ||
        (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')
      ) {
        const latestCheckIn = await prisma.checkIn.findUnique({
          where: { alumniRegistrationId: registration.id },
        });

        return {
          status: 'ALREADY_CHECKED_IN',
          message: 'This QR code has already been used for entry.',
          alumni: {
            fullName: registration.fullName,
            registrationId: registration.registrationId,
            graduationYear: registration.graduationYear,
            degree: registration.degree,
            course: registration.course,
            otherDegree: registration.otherDegree,
            otherCourse: registration.otherCourse,
            branch: registration.branch,
            companyName: registration.companyName,
            designation: registration.designation,
            currentCity: registration.currentCity,
          },
          checkedInAt: latestCheckIn?.checkedInAt.toISOString() || new Date().toISOString(),
          checkedInBy: latestCheckIn?.checkedInBy,
          gateName: latestCheckIn?.gateName,
        };
      }
      throw err;
    }
  }

  /**
   * Manual Check-in by Registration ID (e.g. JECRC-DIWALI-2026-0042)
   */
  async manualCheckInByRegistrationId(
    registrationId: string,
    checkedInBy: string,
    gateName = 'Gate 01 (Main Gate)'
  ): Promise<VerificationResponse> {
    const formattedId = registrationId.trim().toUpperCase();

    const registration = await prisma.alumniRegistration.findUnique({
      where: { registrationId: formattedId },
      include: {
        checkIn: true,
      },
    });

    if (!registration) {
      return {
        status: 'INVALID',
        message: `Registration ID "${formattedId}" not found. Please verify with the registration desk.`,
      };
    }

    if (registration.checkIn) {
      return {
        status: 'ALREADY_CHECKED_IN',
        message: 'This registration has already been checked in.',
        alumni: {
          fullName: registration.fullName,
          registrationId: registration.registrationId,
          graduationYear: registration.graduationYear,
          degree: registration.degree,
          course: registration.course,
          otherDegree: registration.otherDegree,
          otherCourse: registration.otherCourse,
          branch: registration.branch,
          companyName: registration.companyName,
          designation: registration.designation,
          currentCity: registration.currentCity,
        },
        checkedInAt: registration.checkIn.checkedInAt.toISOString(),
        checkedInBy: registration.checkIn.checkedInBy,
        gateName: registration.checkIn.gateName,
      };
    }

    const checkInRecord = await prisma.checkIn.create({
      data: {
        alumniRegistrationId: registration.id,
        checkedInAt: new Date(),
        checkedInBy,
        gateName,
      },
    });

    return {
      status: 'SUCCESS',
      message: 'Manual entry approved. Welcome Back!',
      alumni: {
        fullName: registration.fullName,
        registrationId: registration.registrationId,
        graduationYear: registration.graduationYear,
        degree: registration.degree,
        course: registration.course,
        otherDegree: registration.otherDegree,
        otherCourse: registration.otherCourse,
        branch: registration.branch,
        companyName: registration.companyName,
        designation: registration.designation,
        currentCity: registration.currentCity,
      },
      checkedInAt: checkInRecord.checkedInAt.toISOString(),
      checkedInBy: checkInRecord.checkedInBy,
      gateName: checkInRecord.gateName,
    };
  }
}

export const checkInService = new CheckInService();
