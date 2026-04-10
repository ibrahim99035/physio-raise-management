import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

serviceSchema.plugin(softDeletePlugin);

export const Service = mongoose.model('Service', serviceSchema);
