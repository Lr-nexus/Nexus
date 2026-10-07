const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schema.index({ communityId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityMember', schema);