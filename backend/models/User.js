const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: null, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  photoIdUrl: { type: String, default: null },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true, name: 'uniq_email' });
userSchema.index({ role: 1 }, { name: 'idx_role' });

module.exports = mongoose.model('User', userSchema, 'users');
