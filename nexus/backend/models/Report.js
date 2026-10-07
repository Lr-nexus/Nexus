const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: {
      type: String,
      enum: ['user', 'post', 'comment', 'message', 'story', 'vibe', 'community', 'channel', 'group'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate', 'nudity', 'violence', 'misinformation', 'self_harm', 'other'],
      required: true,
    },
    description: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['pending', 'under_review', 'resolved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    action: { type: String, enum: ['none', 'content_removed', 'user_warned', 'user_suspended', 'user_banned'], default: 'none' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

schema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', schema);