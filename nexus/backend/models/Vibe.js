const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    caption: { type: String, default: '', maxlength: 500 },
    hashtags: [{ type: String, index: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    music: { title: String, artist: String, url: String },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
  },
  { timestamps: true }
);

schema.index({ createdAt: -1 });

module.exports = mongoose.model('Vibe', schema);