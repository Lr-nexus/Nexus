const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    optionIndexes: [{ type: Number, required: true }],
  },
  { timestamps: true }
);

schema.index({ pollId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PollVote', schema);