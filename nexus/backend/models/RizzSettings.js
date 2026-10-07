const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  personality: { type: String, default: 'confident' },
  defaultStyle: { type: String, default: 'smooth' },
  historyEnabled: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('RizzSettings', schema);