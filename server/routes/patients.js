import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { archivePatient, createPatient, listPatients, updatePatient } from '../controllers/patientController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listPatients);
router.post('/', createPatient);
router.patch('/:id', updatePatient);
router.delete('/:id', archivePatient);

export default router;
