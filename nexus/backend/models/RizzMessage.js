const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'RizzConversation', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  style: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('RizzMessage', schema);