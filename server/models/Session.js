import mongoose from 'mongoose';
import { objectId, softDeletePlugin } from './plugins.js';

const sessionSchema = new mongoose.Schema(
  {
    appointment: { type: objectId, ref: 'Appointment', required: true, unique: true },
    patient: { type: objectId, ref: 'Patient', required: true },
    therapists: [{ type: objectId, ref: 'User', required: true }],
    service: { type: objectId, ref: 'Service', required: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

sessionSchema.plugin(softDeletePlugin);

export const Session = mongoose.model('Session', sessionSchema);
