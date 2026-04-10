import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { archiveService, createService, listServices, updateService } from '../controllers/serviceController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listServices);

router.post('/', requireRole('admin'), createService);

router.patch('/:id', requireRole('admin'), updateService);

router.delete('/:id', requireRole('admin'), archiveService);

export default router;
