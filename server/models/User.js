import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { softDeletePlugin } from './plugins.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: ['admin', 'receptionist', 'therapist'],
      default: ['receptionist']
    },
    contactInfo: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.plugin(softDeletePlugin);

userSchema.methods.verifyPassword = function verifyPassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(rawPassword) {
  return bcrypt.hash(rawPassword, 10);
};

export const User = mongoose.model('User', userSchema);
