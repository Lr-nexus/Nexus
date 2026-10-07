const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

schema.index({ storyId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('StoryReaction', schema);