import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { appointmentStatusReport, therapistPerformanceReport } from '../controllers/reportController.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/appointments/status', appointmentStatusReport);
router.get('/therapists/performance', therapistPerformanceReport);

export default router;
