const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    statusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true, index: true },
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

schema.index({ statusId: 1, viewerId: 1 }, { unique: true });

module.exports = mongoose.model('StatusView', schema);