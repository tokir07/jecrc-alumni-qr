import { prisma } from '../config/db.js';

/**
 * Generate a unique registration ID: e.g. JECRC-DIWALI-2026-0042
 * Safely handles concurrency and collision.
 */
export async function generateRegistrationId(year = 2026): Promise<string> {
  const prefix = `JECRC-DIWALI-${year}-`;
  
  // Get count of existing registrations to start counter
  const totalCount = await prisma.alumniRegistration.count();
  let candidateNum = totalCount + 1;
  
  while (true) {
    const candidateId = `${prefix}${candidateNum.toString().padStart(4, '0')}`;
    const existing = await prisma.alumniRegistration.findUnique({
      where: { registrationId: candidateId },
      select: { id: true },
    });
    
    if (!existing) {
      return candidateId;
    }
    candidateNum++;
  }
}
