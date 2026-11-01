import { Router } from 'express';
import {
  createRegistration,
  getRegistration,
} from '../controllers/registration.controller.js';
import { registrationRateLimiter, lookupRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public registration endpoint
router.post('/', registrationRateLimiter, createRegistration);

// Public lookup of registration by ID (safe, rate-limited to prevent automated scraping)
router.get('/:registrationId', lookupRateLimiter, getRegistration);

export default router;
