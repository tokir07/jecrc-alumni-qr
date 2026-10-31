import rateLimit from 'express-rate-limit';

// Public registration rate limiter: max 30 registrations per 15 minutes per IP
export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many registration attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin/Volunteer login rate limiter: max 10 attempts per 15 minutes
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Verification rate limiter: up to 180 scans per minute to allow rapid gate scanning
export const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  message: {
    success: false,
    error: 'Scanning rate limit exceeded. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
