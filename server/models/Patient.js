import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    medicalHistory: { type: String, default: '' }
  },
  { timestamps: true }
);

patientSchema.plugin(softDeletePlugin);

export const Patient = mongoose.model('Patient', patientSchema);
