import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { archiveExpense, createExpense, listExpenses, monthlySummary } from '../controllers/financeController.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/expenses', listExpenses);
router.post('/expenses', createExpense);
router.delete('/expenses/:id', archiveExpense);
router.get('/summary/monthly', monthlySummary);

export default router;
