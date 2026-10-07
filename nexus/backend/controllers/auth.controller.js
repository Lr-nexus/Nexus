const User = require('../models/User');
const Session = require('../models/Session');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const tokenService = require('../services/token.service');
const passwordService = require('../services/password.service');
const { sha256 } = require('../utils/hash');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/ApiResponse');

function publicUser(u) {
  return {
    id: u._id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    phone: u.phone,
    profilePicture: u.profilePicture,
    bio: u.bio,
    role: u.role,
    isPrivate: u.isPrivate,
    isEmailVerified: u.isEmailVerified,
  };
}

async function issueSessionAndTokens(user, req) {
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: 'pending',
    deviceId: req.body?.deviceId || '',
    deviceName: req.body?.deviceName || 'Unknown device',
    platform: req.body?.platform || 'unknown',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || '',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const accessToken = tokenService.signAccess({
    sub: user._id.toString(),
    sid: session._id.toString(),
  });
  const refreshToken = tokenService.signRefresh({
    sub: user._id.toString(),
    sid: session._id.toString(),
  });

  session.refreshTokenHash = sha256(refreshToken);
  await session.save();
  return { accessToken, refreshToken, sessionId: session._id };
}

// ─────────────────────────────────────────────
// REGISTRATION — password + OTP email verification
// ─────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { fullName, username, email, phone, dateOfBirth, password } = req.body;

  const pwErr = passwordService.validate(password);
  if (pwErr) throw new ApiError(400, pwErr);

  const emailLc = email.toLowerCase();
  const usernameLc = username.toLowerCase();

  const existingByEmail = await User.findOne({ email: emailLc }).select('+passwordHash');
  if (existingByEmail && existingByEmail.isEmailVerified) {
    throw new ApiError(409, 'Account already exists. Please log in.');
  }

  const conflict = await User.findOne({
    _id: { $ne: existingByEmail?._id || null },
    $or: [{ username: usernameLc }, { phone }],
  });
  if (conflict) throw new ApiError(409, 'Username or phone already in use.');

  const passwordHash = await passwordService.hash(password);

  let user;
  if (existingByEmail) {
    existingByEmail.fullName = fullName;
    existingByEmail.username = usernameLc;
    existingByEmail.phone = phone;
    existingByEmail.dateOfBirth = new Date(dateOfBirth);
    existingByEmail.passwordHash = passwordHash;
    user = await existingByEmail.save();
  } else {
    user = await User.create({
      fullName, username: usernameLc, email: emailLc, phone,
      dateOfBirth: new Date(dateOfBirth), passwordHash,
    });
  }

  await otpService.createAndSend({
    userId: user._id,
    email: user.email,
    phone: user.phone,
    purpose: 'REGISTRATION',
    sendFn: emailService.sendOtpEmail,
  });

  return created(
    res,
    { userId: user._id, email: user.email },
    'Account created. Check your email for the verification code.'
  );
});

// ─────────────────────────────────────────────
// LOGIN — password only (no OTP)
// ─────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) throw new ApiError(400, 'Identifier and password required.');

  const isEmail = identifier.includes('@');
  const user = await User.findOne(
    isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }
  ).select('+passwordHash');

  if (!user) throw new ApiError(401, 'Invalid credentials.');

  const ok = await passwordService.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials.');

  if (!user.isEmailVerified) {
    await otpService.createAndSend({
      userId: user._id, email: user.email, phone: user.phone,
      purpose: 'REGISTRATION', sendFn: emailService.sendOtpEmail,
    });
    return res.status(403).json({
      success: false,
      message: 'Please verify your email. We sent a new code.',
      needsVerification: true,
      identifier: user.email,
      purpose: 'REGISTRATION',
    });
  }

  if (user.status !== 'active') throw new ApiError(403, 'Account is not active.');

  user.lastSeenAt = new Date();
  await user.save();

  const tokens = await issueSessionAndTokens(user, req);
  return ok(res, { ...tokens, user: publicUser(user) }, 'Login successful');
});

// ─────────────────────────────────────────────
// OTP — used for registration verification and account recovery
// ─────────────────────────────────────────────
exports.requestOtp = asyncHandler(async (req, res) => {
  const { identifier, purpose } = req.body;
  const isEmail = identifier.includes('@');
  const user = await User.findOne(
    isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }
  );

  const generic = { message: 'If the account is eligible, a verification code has been sent.' };
  if (!user) return ok(res, generic);

  const cooldown = await otpService.cooldownRemaining(user.email, purpose);
  if (cooldown > 0) return ok(res, { ...generic, cooldown });

  await otpService.createAndSend({
    userId: user._id, email: user.email, phone: user.phone,
    purpose, sendFn: emailService.sendOtpEmail,
  });

  return ok(res, generic);
});

exports.resendOtp = asyncHandler(async (req, res) => exports.requestOtp(req, res));

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { identifier, otp, purpose } = req.body;
  const isEmail = identifier.includes('@');
  const user = await User.findOne(
    isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }
  );
  if (!user) throw new ApiError(400, 'Invalid code.');

  await otpService.verify({ email: user.email, otp, purpose });

  if (purpose === 'REGISTRATION') {
    user.isEmailVerified = true;
    user.lastSeenAt = new Date();
    await user.save();
    const tokens = await issueSessionAndTokens(user, req);
    return ok(res, { ...tokens, user: publicUser(user) }, 'Authentication successful');
  }

  if (purpose === 'ACCOUNT_RECOVERY') {
    const resetToken = tokenService.signAccess({
      sub: user._id.toString(),
      purpose: 'PASSWORD_RESET',
    });
    return ok(res, { resetToken, userId: user._id }, 'Code verified. Set your new password.');
  }

  const tokens = await issueSessionAndTokens(user, req);
  return ok(res, { ...tokens, user: publicUser(user) }, 'Authentication successful');
});

// ─────────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) throw new ApiError(400, 'resetToken and newPassword required.');

  const pwErr = passwordService.validate(newPassword);
  if (pwErr) throw new ApiError(400, pwErr);

  let decoded;
  try { decoded = tokenService.verifyAccess(resetToken); }
  catch { throw new ApiError(401, 'Reset link expired. Start again.'); }

  if (decoded.purpose !== 'PASSWORD_RESET') throw new ApiError(401, 'Invalid reset token.');

  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(404, 'User not found.');

  user.passwordHash = await passwordService.hash(newPassword);
  user.isEmailVerified = true;
  await user.save();

  const tokens = await issueSessionAndTokens(user, req);
  return ok(res, { ...tokens, user: publicUser(user) }, 'Password updated.');
});

// ─────────────────────────────────────────────
// Session / refresh / logout
// ─────────────────────────────────────────────
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Missing refresh token.');
  let decoded;
  try { decoded = tokenService.verifyRefresh(refreshToken); }
  catch { throw new ApiError(401, 'Invalid refresh token.'); }

  const session = await Session.findById(decoded.sid);
  if (!session || session.revokedAt) throw new ApiError(401, 'Session revoked.');
  if (session.refreshTokenHash !== sha256(refreshToken)) throw new ApiError(401, 'Token mismatch.');

  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(401, 'User not found.');

  const accessToken = tokenService.signAccess({ sub: user._id.toString(), sid: session._id.toString() });
  const newRefresh = tokenService.signRefresh({ sub: user._id.toString(), sid: session._id.toString() });
  session.refreshTokenHash = sha256(newRefresh);
  session.lastActiveAt = new Date();
  await session.save();

  return ok(res, { accessToken, refreshToken: newRefresh, user: publicUser(user) });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const decoded = tokenService.verifyRefresh(refreshToken);
      await Session.findByIdAndUpdate(decoded.sid, { revokedAt: new Date() });
    } catch {}
  }
  return ok(res, {}, 'Logged out.');
});

exports.logoutAll = asyncHandler(async (req, res) => {
  await Session.updateMany({ userId: req.user._id, revokedAt: null }, { revokedAt: new Date() });
  return ok(res, {}, 'Logged out from all devices.');
});

exports.me = asyncHandler(async (req, res) => ok(res, { user: publicUser(req.user) }));

exports.sessions = asyncHandler(async (req, res) => {
  const list = await Session.find({ userId: req.user._id, revokedAt: null }).sort({ lastActiveAt: -1 });
  return ok(res, { sessions: list });
});

exports.revokeSession = asyncHandler(async (req, res) => {
  await Session.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { revokedAt: new Date() }
  );
  return ok(res, {}, 'Session revoked.');
});