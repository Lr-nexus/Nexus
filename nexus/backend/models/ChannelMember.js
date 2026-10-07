const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'subscriber'], default: 'subscriber' },
    notificationsEnabled: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schema.index({ channelId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ChannelMember', schema);