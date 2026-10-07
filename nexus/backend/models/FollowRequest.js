const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

schema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model('FollowRequest', schema);