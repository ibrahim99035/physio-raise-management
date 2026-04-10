import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

expenseSchema.plugin(softDeletePlugin);

export const Expense = mongoose.model('Expense', expenseSchema);
