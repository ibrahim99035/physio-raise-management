import { Session } from '../models/Session.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSessions = asyncHandler(async (_req, res) => {
  const sessions = await Session.find({})
    .populate('patient', 'name phone')
    .populate('therapists', 'name')
    .populate('service', 'name price')
    .sort({ createdAt: -1 });

  res.json(sessions);
});

export const createSession = asyncHandler(async (req, res) => {
  const session = await Session.create(req.body);
  res.status(201).json(session);
});

export const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!session) return res.status(404).json({ message: 'Session not found' });
  res.json(session);
});
