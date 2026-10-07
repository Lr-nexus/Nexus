const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.signAccess = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

exports.signRefresh = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

exports.verifyAccess = (t) => jwt.verify(t, env.JWT_SECRET);
exports.verifyRefresh = (t) => jwt.verify(t, env.JWT_REFRESH_SECRET);