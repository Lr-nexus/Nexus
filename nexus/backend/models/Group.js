const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 500 },
    photo: { type: String, default: '' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    isPrivate: { type: Boolean, default: false },
    membersCount: { type: Number, default: 1 },
    settings: {
      onlyAdminsCanPost: { type: Boolean, default: false },
      onlyAdminsCanEdit: { type: Boolean, default: true },
      approveNewMembers: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

schema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Group', schema);