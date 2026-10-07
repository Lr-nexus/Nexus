const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

schema.index({ messageId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('MessageReaction', schema);