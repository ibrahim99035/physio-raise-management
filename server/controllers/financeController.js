import { Expense } from '../models/Expense.js';
import { Session } from '../models/Session.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listExpenses = asyncHandler(async (_req, res) => {
  const expenses = await Expense.find({}).sort({ date: -1 });
  res.json(expenses);
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json(expense);
});

export const archiveExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).setOptions({ includeArchived: true });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  await expense.archive();
  res.status(204).send();
});

export const monthlySummary = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0));

  const sessions = await Session.find({ createdAt: { $gte: start, $lt: end } }).populate('service', 'price');
  const expenses = await Expense.find({ date: { $gte: start, $lt: end } });

  const revenue = sessions.reduce((sum, s) => sum + (s.service?.price || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    start,
    end,
    revenue,
    expenses: totalExpenses,
    profit: revenue - totalExpenses
  });
});
