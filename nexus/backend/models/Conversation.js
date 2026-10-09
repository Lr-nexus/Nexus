const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['direct', 'group'], default: 'direct' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    name: { type: String, default: '' },
    photo: { type: String, default: '' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    locked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);