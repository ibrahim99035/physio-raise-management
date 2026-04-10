import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listTherapists = asyncHandler(async (_req, res) => {
  const therapists = await User.find({ roles: 'therapist' }).select('_id name roles contactInfo').sort({ name: 1 });
  res.json(therapists);
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({}).select('_id name roles contactInfo').sort({ name: 1 });
  res.json(users);
});
