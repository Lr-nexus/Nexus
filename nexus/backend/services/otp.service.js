const OtpVerification = require('../models/OtpVerification');
const generateOtp = require('../utils/generateOtp');
const { sha256 } = require('../utils/hash');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

exports.createAndSend = async ({ userId = null, email, phone = '', purpose, sendFn }) => {
  const otp = generateOtp(env.OTP_LENGTH);
  const otpHash = sha256(otp);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRATION_MINUTES * 60 * 1000);

  // invalidate previous OTPs of same purpose/email
  await OtpVerification.updateMany(
    { email, purpose, verifiedAt: null },
    { $set: { verifiedAt: new Date() } }
  );

  await OtpVerification.create({
    userId, email, phone, otpHash, purpose,
    maxAttempts: env.OTP_MAX_ATTEMPTS,
    expiresAt, lastSentAt: new Date(),
  });

  await sendFn(email, otp);
  return { email, expiresAt };
};

exports.verify = async ({ email, otp, purpose }) => {
  const record = await OtpVerification.findOne({
    email, purpose, verifiedAt: null,
  }).sort({ createdAt: -1 });

  if (!record) throw new ApiError(400, 'No active code. Request a new one.');
  if (record.expiresAt < new Date()) throw new ApiError(400, 'Code expired. Request a new one.');
  if (record.attempts >= record.maxAttempts) throw new ApiError(429, 'Too many attempts.');

  const ok = sha256(otp) === record.otpHash;
  record.attempts += 1;

  if (!ok) { await record.save(); throw new ApiError(400, 'Invalid code.'); }

  record.verifiedAt = new Date();
  await record.save();
  return true;
};

exports.cooldownRemaining = async (email, purpose) => {
  const last = await OtpVerification.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (!last) return 0;
  const diff = (Date.now() - new Date(last.lastSentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(env.OTP_RESEND_COOLDOWN_SECONDS - diff));
};