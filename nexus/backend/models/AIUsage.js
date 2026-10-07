const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    service: { type: String, enum: ['rizz', 'nexus_ai'], required: true },
    endpoint: { type: String, default: '' },
    promptTokens: { type: Number, default: 0 },
    responseTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
    errorMessage: { type: String, default: '' },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIUsage', schema);