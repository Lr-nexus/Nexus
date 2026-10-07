const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    deviceId: { type: String, default: '' },
    deviceName: { type: String, default: 'Unknown device' },
    platform: { type: String, default: 'unknown' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);