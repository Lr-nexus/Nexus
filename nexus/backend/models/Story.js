const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['image', 'video', 'text'], default: 'image' },
    media: { url: String, publicId: String, mimeType: String, thumbnail: String },
    text: { type: String, default: '' },
    textStyle: {
      color: { type: String, default: '#FFFFFF' },
      background: { type: String, default: '#2563EB' },
    },
    stickers: [{ emoji: String, x: Number, y: Number, scale: Number }],
    music: { title: String, artist: String, url: String },
    privacy: { type: String, enum: ['everyone', 'followers', 'close', 'selected'], default: 'everyone' },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hiddenFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewsCount: { type: Number, default: 0 },
    reactionsCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', schema);