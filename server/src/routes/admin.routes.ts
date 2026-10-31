import { Router } from 'express';
import {
  getDashboard,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  exportRegistrations,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Strictly Admin-only routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/registrations', getRegistrations);
router.get('/registrations/:id', getRegistrationById);
router.put('/registrations/:id', updateRegistration);
router.get('/export', exportRegistrations);

export default router;
