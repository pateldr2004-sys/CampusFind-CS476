const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Authentication required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusfind_dev_secret_change_me');
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || user.status !== 'active') throw new ApiError(401, 'Invalid or inactive account');

    req.user = user;
    next();
  } catch (err) {
    next(err.statusCode ? err : new ApiError(401, 'Invalid or expired token'));
  }
}

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { protect, requireRole };
