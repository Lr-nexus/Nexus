const { verifyAccess } = require('../services/token.service');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

exports.requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Authentication required.');
    const decoded = verifyAccess(token);
    const user = await User.findById(decoded.sub);
    if (!user) throw new ApiError(401, 'User no longer exists.');
    if (user.status !== 'active') throw new ApiError(403, 'Account is not active.');
    req.user = user;
    next();
  } catch (e) {
    next(e.statusCode ? e : new ApiError(401, 'Invalid or expired token.'));
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin only.'));
  next();
};