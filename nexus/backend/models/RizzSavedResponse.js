const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
  style: { type: String, default: 'smooth' },
}, { timestamps: true });
module.exports = mongoose.model('RizzSavedResponse', schema);