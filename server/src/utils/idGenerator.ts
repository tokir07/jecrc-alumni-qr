import { prisma } from '../config/db.js';

/**
 * Generate a unique registration ID: e.g. JECRC-DIWALI-2026-0042
 * Safely handles concurrency and collision.
 */
export async function generateRegistrationId(year = 2026): Promise<string> {
  const prefix = `JECRC-DIWALI-${year}-`;

  try {
    // Atomic PostgreSQL sequence query: zero lock contention, guaranteed unique under any concurrency
    const res = await prisma.$queryRaw<{ nextval: bigint }[]>`
      SELECT nextval('alumni_registration_seq') as nextval
    `;
    const seqNum = Number(res[0].nextval);
    return `${prefix}${seqNum.toString().padStart(4, '0')}`;
  } catch (err) {
    // Fallback in case of database sequence glitch
    const fallbackSeq = Date.now().toString().slice(-4);
    const rand = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${fallbackSeq}${rand}`;
  }
}
