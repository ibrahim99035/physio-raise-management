import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { archiveStaff, createStaff, listStaff, updateStaff } from '../controllers/staffController.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/', listStaff);
router.post('/', createStaff);
router.patch('/:id', updateStaff);
router.delete('/:id', archiveStaff);

export default router;
