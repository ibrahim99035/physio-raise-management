import { Staff } from '../models/Staff.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listStaff = asyncHandler(async (_req, res) => {
  const staff = await Staff.find({}).populate('user', 'name email roles contactInfo');
  res.json(staff);
});

export const createStaff = asyncHandler(async (req, res) => {
  const record = await Staff.create(req.body);
  res.status(201).json(record);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const record = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) return res.status(404).json({ message: 'Staff record not found' });
  res.json(record);
});

export const archiveStaff = asyncHandler(async (req, res) => {
  const record = await Staff.findById(req.params.id).setOptions({ includeArchived: true });
  if (!record) return res.status(404).json({ message: 'Staff record not found' });
  await record.archive();
  res.status(204).send();
});
