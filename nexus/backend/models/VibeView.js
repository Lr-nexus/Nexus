const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    vibeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vibe', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, default: '' },
    watchSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VibeView', schema);