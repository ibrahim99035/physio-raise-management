import mongoose from 'mongoose';
import { objectId, softDeletePlugin } from './plugins.js';

const staffSchema = new mongoose.Schema(
  {
    user: { type: objectId, ref: 'User', required: true, unique: true },
    baseSalary: { type: Number, default: 0, min: 0 },
    commissionPerSession: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

staffSchema.plugin(softDeletePlugin);

export const Staff = mongoose.model('Staff', staffSchema);
