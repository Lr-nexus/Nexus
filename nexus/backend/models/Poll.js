const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true, maxlength: 300 },
    options: [{ text: { type: String, required: true }, votes: { type: Number, default: 0 } }],
    multipleChoice: { type: Boolean, default: false },
    anonymous: { type: Boolean, default: false },
    contextType: { type: String, enum: ['chat', 'group', 'community', 'channel', 'post'], required: true },
    contextId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    endsAt: { type: Date, default: null },
    totalVotes: { type: Number, default: 0 },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Poll', schema);