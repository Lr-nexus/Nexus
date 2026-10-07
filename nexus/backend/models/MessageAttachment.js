const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    name: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessageAttachment', schema);