import { Router } from 'express';
import { verifyQrCheckIn, manualCheckIn } from '../controllers/checkin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { verifyRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Both ADMIN and VOLUNTEER roles can verify and check in alumni
router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'VOLUNTEER'));

// Fast QR code verification
router.post('/verify', verifyRateLimiter, verifyQrCheckIn);

// Manual Registration ID entry gate check-in
router.post('/manual', verifyRateLimiter, manualCheckIn);

export default router;
