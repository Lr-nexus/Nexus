const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    callId: { type: mongoose.Schema.Types.ObjectId, ref: 'Call', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ringing', 'joined', 'left', 'missed', 'rejected'], default: 'ringing' },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CallParticipant', schema);