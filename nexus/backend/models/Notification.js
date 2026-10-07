const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'follow', 'follow_request', 'follow_accepted',
        'like', 'comment', 'reply', 'mention',
        'story_reaction', 'message', 'group_add',
        'call', 'channel_post', 'community_invite',
        'rizz_ready', 'system',
      ],
      required: true,
    },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetType: { type: String, default: '' },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', schema);