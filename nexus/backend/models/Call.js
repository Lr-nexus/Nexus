const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['audio', 'video'], default: 'audio' },
    isGroup: { type: Boolean, default: false },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    status: { type: String, enum: ['ringing', 'ongoing', 'ended', 'missed', 'rejected'], default: 'ringing' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Call', schema);