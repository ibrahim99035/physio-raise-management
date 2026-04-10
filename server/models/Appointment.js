import mongoose from 'mongoose';
import { objectId, softDeletePlugin } from './plugins.js';

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: objectId, ref: 'Patient', required: true },
    therapists: [{ type: objectId, ref: 'User', required: true }],
    service: { type: objectId, ref: 'Service', required: true },
    startsAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 15, default: 60 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    }
  },
  { timestamps: true }
);

appointmentSchema.plugin(softDeletePlugin);

appointmentSchema.virtual('endsAt').get(function getEndDate() {
  return new Date(this.startsAt.getTime() + this.durationMinutes * 60 * 1000);
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
