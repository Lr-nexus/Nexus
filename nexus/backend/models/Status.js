const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['text', 'image', 'video', 'gif'], default: 'text' },
    content: { type: String, default: '' },
    media: { url: String, publicId: String, mimeType: String },
    background: { type: String, default: '#2563EB' },
    privacy: { type: String, enum: ['everyone', 'followers', 'close', 'selected'], default: 'everyone' },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewsCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Status', schema);