import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { createSession, listSessions, updateSession } from '../controllers/sessionController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listSessions);

router.post('/', requireRole('admin', 'therapist'), createSession);

router.patch('/:id', requireRole('admin', 'therapist'), updateSession);

export default router;
