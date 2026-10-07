const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    requestsToday: { type: Number, default: 0 },
    requestsThisMonth: { type: Number, default: 0 },
    tokensUsedMonth: { type: Number, default: 0 },
    lastRequestAt: { type: Date, default: null },
    lastResetDay: { type: Date, default: Date.now },
    lastResetMonth: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RizzUsage', schema);