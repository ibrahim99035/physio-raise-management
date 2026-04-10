import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function fixedUser() {
  return {
    id: 'single-user',
    name: 'Single User',
    email: 'single@local',
    roles: ['admin']
  };
}

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email }).setOptions({ includeArchived: true });
  if (existing) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, roles: ['admin'] });

  return res.status(201).json({ id: user._id, email: user.email });
});

export const login = asyncHandler(async (req, res) => {
  return res.json({ user: fixedUser() });
});

export function logout(req, res) {
  return res.status(204).send();
}

export function me(req, res) {
  return res.json({ user: fixedUser() });
}
