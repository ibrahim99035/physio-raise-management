import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await user.verifyPassword(password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles
  };

  return req.session.save((error) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to create session' });
    }

    return res.json({ user: req.session.user });
  });
});

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_NAME || 'physion.sid');
    res.status(204).send();
  });
}

export function me(req, res) {
  res.json({ user: req.session.user });
}
