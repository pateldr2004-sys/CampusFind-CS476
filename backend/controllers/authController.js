const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const { toPublicUploadPath } = require('../middleware/uploadMiddleware');

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    photoIdUrl: user.photoIdUrl
  };
}

const signup = asyncHandler(async (req, res) => {
  const fullName = req.body.fullName || req.body.name;
  const { email, password, phone } = req.body;

  if (!fullName || !email || !password || !phone) {
    throw new ApiError(400, 'Full name, email, password, and phone are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    phone,
    role: 'user',
    photoIdUrl: toPublicUploadPath(req.file),
    status: 'active'
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please log in.',
    user: publicUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid email or password');
  if (user.status !== 'active') throw new ApiError(403, 'This account is not active');

  res.json({ success: true, token: signToken(user), user: publicUser(user) });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Admin email and password are required');

  const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
  if (!user) throw new ApiError(401, 'Invalid admin credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid admin credentials');
  if (user.status !== 'active') throw new ApiError(403, 'This admin account is not active');

  res.json({ success: true, token: signToken(user), user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

module.exports = { signup, login, adminLogin, me };
