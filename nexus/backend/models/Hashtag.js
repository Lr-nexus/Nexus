const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    postsCount: { type: Number, default: 0 },
    vibesCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hashtag', schema);