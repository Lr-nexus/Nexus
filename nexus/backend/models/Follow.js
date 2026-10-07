const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', schema);