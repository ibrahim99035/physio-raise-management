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

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles, contactInfo = '' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existing = await User.findOne({ email }).setOptions({ includeArchived: true });
  if (existing) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    roles: Array.isArray(roles) && roles.length ? roles : ['receptionist'],
    contactInfo
  });

  return res.status(201).json({ _id: user._id, name: user.name, email: user.email, roles: user.roles, contactInfo: user.contactInfo });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles, contactInfo } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (Array.isArray(roles)) updates.roles = roles;
  if (contactInfo !== undefined) updates.contactInfo = contactInfo;
  if (password) {
    updates.passwordHash = await User.hashPassword(password);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ _id: user._id, name: user.name, email: user.email, roles: user.roles, contactInfo: user.contactInfo });
});
