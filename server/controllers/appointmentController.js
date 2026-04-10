import { Appointment } from '../models/Appointment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function ensureNoOverlap({ appointmentId, therapists, startsAt, durationMinutes }) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const candidates = await Appointment.find({
    _id: appointmentId ? { $ne: appointmentId } : { $exists: true },
    therapists: { $in: therapists },
    status: { $in: ['scheduled', 'completed'] }
  });

  for (const item of candidates) {
    const itemStart = new Date(item.startsAt);
    const itemEnd = new Date(itemStart.getTime() + item.durationMinutes * 60 * 1000);
    const overlap = start < itemEnd && end > itemStart;
    if (overlap) return false;
  }

  return true;
}

export const listAppointments = asyncHandler(async (_req, res) => {
  const records = await Appointment.find({})
    .populate('patient', 'name phone')
    .populate('therapists', 'name roles')
    .populate('service', 'name price')
    .sort({ startsAt: 1 });

  res.json(records);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { therapists, startsAt, durationMinutes } = req.body;

  const ok = await ensureNoOverlap({ therapists, startsAt, durationMinutes: Number(durationMinutes || 60) });
  if (!ok) {
    return res.status(409).json({ message: 'Therapist overlap detected' });
  }

  const record = await Appointment.create({ ...req.body, durationMinutes: Number(durationMinutes || 60) });
  res.status(201).json(record);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const current = await Appointment.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Appointment not found' });

  const therapists = req.body.therapists || current.therapists;
  const startsAt = req.body.startsAt || current.startsAt;
  const durationMinutes = Number(req.body.durationMinutes || current.durationMinutes);

  const ok = await ensureNoOverlap({
    appointmentId: current._id,
    therapists,
    startsAt,
    durationMinutes
  });

  if (!ok) {
    return res.status(409).json({ message: 'Therapist overlap detected' });
  }

  Object.assign(current, req.body, { durationMinutes });
  await current.save();
  res.json(current);
});

export const archiveAppointment = asyncHandler(async (req, res) => {
  const record = await Appointment.findById(req.params.id).setOptions({ includeArchived: true });
  if (!record) return res.status(404).json({ message: 'Appointment not found' });
  await record.archive();
  res.status(204).send();
});
