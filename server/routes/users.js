import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUser, listTherapists, listUsers, updateUser } from '../controllers/userController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.get('/therapists', listTherapists);

export default router;
