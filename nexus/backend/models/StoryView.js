const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true, index: true },
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ storyId: 1, viewerId: 1 }, { unique: true });

module.exports = mongoose.model('StoryView', schema);