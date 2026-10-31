import { Router } from 'express';
import {
  createRegistration,
  getRegistration,
} from '../controllers/registration.controller.js';
import { registrationRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public registration endpoint
router.post('/', registrationRateLimiter, createRegistration);

// Public lookup of registration by ID (safe, no secret tokens)
router.get('/:registrationId', getRegistration);

export default router;
