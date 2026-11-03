import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

// Global API protection: max 1000 requests per 15 minutes per IP (supports ~50 concurrent users on shared campus Wi-Fi)
export const apiGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 1000,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please slow down and try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public registration rate limiter: allows up to 150 registrations per 15 minutes per IP
export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 5000 : 150,
  message: {
    success: false,
    error: 'Too many registration attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public registration ID lookup rate limiter (prevents automated scraping)
export const lookupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 5000 : 120,
  message: {
    success: false,
    error: 'Too many lookup requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin/Volunteer login rate limiter: max 10 failed attempts per 15 minutes
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 500 : 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many failed login attempts. For security reasons, this IP has been temporarily locked out for 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Gate Verification rate limiter: up to 300 scans per minute to allow rapid gate scanning
export const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 5000 : 300,
  message: {
    success: false,
    error: 'Gate scanning rate limit exceeded. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
