import { Router } from 'express';
import {
  login,
  logout,
  getCurrentUser,
  getVolunteers,
  createVolunteer,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public auth endpoints
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);

// Authenticated session check
router.get('/me', authenticate, getCurrentUser);

// Admin-only volunteer management
router.get('/volunteers', authenticate, authorizeRoles('ADMIN'), getVolunteers);
router.post('/volunteers', authenticate, authorizeRoles('ADMIN'), createVolunteer);

export default router;
