import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  archiveAppointment,
  createAppointment,
  listAppointments,
  updateAppointment
} from '../controllers/appointmentController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listAppointments);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
router.delete('/:id', archiveAppointment);

export default router;
