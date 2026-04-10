import { Appointment } from '../models/Appointment.js';
import { Session } from '../models/Session.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const appointmentStatusReport = asyncHandler(async (_req, res) => {
  const agg = await Appointment.aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json(agg);
});

export const therapistPerformanceReport = asyncHandler(async (_req, res) => {
  const agg = await Session.aggregate([
    { $match: { isArchived: false } },
    { $unwind: '$therapists' },
    { $group: { _id: '$therapists', sessionsCompleted: { $sum: 1 } } }
  ]);

  res.json(agg);
});
