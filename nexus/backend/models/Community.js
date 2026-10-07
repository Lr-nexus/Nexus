const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 1000 },
    photo: { type: String, default: '' },
    cover: { type: String, default: '' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    announcementChannelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    isPrivate: { type: Boolean, default: false },
    membersCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

schema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', schema);