const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    vibeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vibe', required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VibeComment', schema);