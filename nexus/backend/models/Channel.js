const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 500 },
    photo: { type: String, default: '' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isPrivate: { type: Boolean, default: false },
    subscribersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Channel', schema);