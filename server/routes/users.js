import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listTherapists, listUsers } from '../controllers/userController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listUsers);
router.get('/therapists', listTherapists);

export default router;
