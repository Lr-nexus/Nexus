const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['text', 'image', 'video', 'carousel'], default: 'text' },
    caption: { type: String, default: '' },
    media: [{ url: String, publicId: String, mimeType: String }],
    hashtags: [{ type: String, index: true }],
    location: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'followers', 'close', 'private'], default: 'public' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);