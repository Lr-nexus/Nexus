const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    vibeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vibe', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ vibeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('VibeSave', schema);