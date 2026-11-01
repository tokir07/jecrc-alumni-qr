import rateLimit from 'express-rate-limit';

// Global API protection: max 300 requests per 15 minutes per IP
export const apiGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please slow down and try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public registration rate limiter: max 20 registrations per 15 minutes per IP
export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many registration attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public registration ID lookup rate limiter (prevents ID enumeration/scraping)
export const lookupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many lookup requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin/Volunteer login rate limiter: max 5 failed attempts per 15 minutes
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many failed login attempts. For security reasons, this IP has been temporarily locked out for 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Gate Verification rate limiter: up to 180 scans per minute to allow rapid gate scanning
export const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  message: {
    success: false,
    error: 'Gate scanning rate limit exceeded. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
