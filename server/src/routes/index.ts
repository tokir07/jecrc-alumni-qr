import { Router } from 'express';
import registrationRoutes from './registration.routes.js';
import checkinRoutes from './checkin.routes.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    healthy: true,
    service: 'JECRC Alumni API',
    timestamp: new Date().toISOString(),
  });
});

router.use('/registrations', registrationRoutes);
router.use('/checkin', checkinRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
