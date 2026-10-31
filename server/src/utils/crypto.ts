import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Generate a cryptographically secure random token for QR code payload.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Compute SHA-256 hash of a QR token.
 * Only the hash is stored in the database.
 */
export function hashQrToken(token: string): string {
  // Extract token if a full URL was provided (e.g. http://domain.com/verify?token=XYZ)
  const cleanToken = extractTokenFromPayload(token);
  return crypto.createHash('sha256').update(cleanToken).digest('hex');
}

/**
 * Extract token from potential full URL or raw string
 */
export function extractTokenFromPayload(payload: string): string {
  const trimmed = payload.trim();
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const tokenParam = url.searchParams.get('token');
      if (tokenParam) return tokenParam.trim();
    }
  } catch {
    // If not a valid URL, fallback to raw string
  }
  return trimmed;
}

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a plain password against a bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Normalize email: lowercase and trimmed
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize Indian mobile number: extract the last 10 digits
 */
export function normalizeMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}
