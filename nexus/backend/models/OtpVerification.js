const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: '' },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['REGISTRATION', 'LOGIN', 'EMAIL_VERIFICATION', 'ACCOUNT_RECOVERY'],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('OtpVerification', otpSchema);