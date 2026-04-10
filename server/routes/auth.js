import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { login, logout, me, registerAdmin } from '../controllers/authController.js';

const router = Router();

router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
