const Message = require('../models/Message');
const MessageReaction = require('../models/MessageReaction');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/ApiResponse');

async function ensureMember(messageId, userId) {
  const msg = await Message.findById(messageId);
  if (!msg) throw new ApiError(404, 'Message not found.');
  const convo = await Conversation.findById(msg.conversationId);
  if (!convo || !convo.participants.some((p) => p.equals(userId))) {
    throw new ApiError(403, 'Not allowed.');
  }
  return msg;
}

exports.remove = asyncHandler(async (req, res) => {
  const msg = await ensureMember(req.params.id, req.user._id);
  if (!msg.senderId.equals(req.user._id)) throw new ApiError(403, 'Only sender can delete.');
  msg.isDeleted = true;
  msg.content = '';
  msg.media = undefined;
  await msg.save();
  ok(res, {}, 'Message deleted.');
});

exports.edit = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, 'content required.');
  const msg = await ensureMember(req.params.id, req.user._id);
  if (!msg.senderId.equals(req.user._id)) throw new ApiError(403, 'Only sender can edit.');
  msg.content = content;
  msg.editedAt = new Date();
  await msg.save();
  ok(res, { message: msg });
});

exports.react = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) throw new ApiError(400, 'emoji required.');
  const msg = await ensureMember(req.params.id, req.user._id);

  const existing = await MessageReaction.findOne({ messageId: msg._id, userId: req.user._id });
  if (existing) {
    if (existing.emoji === emoji) {
      await MessageReaction.deleteOne({ _id: existing._id });
      msg.reactions = msg.reactions.filter((r) => !r.userId.equals(req.user._id));
    } else {
      existing.emoji = emoji;
      await existing.save();
      const r = msg.reactions.find((x) => x.userId.equals(req.user._id));
      if (r) r.emoji = emoji;
    }
  } else {
    await MessageReaction.create({ messageId: msg._id, userId: req.user._id, emoji });
    msg.reactions.push({ userId: req.user._id, emoji });
  }
  await msg.save();

  const io = req.app.get('io');
  if (io) io.to(`conversation:${msg.conversationId}`).emit('message:reaction', { messageId: msg._id, reactions: msg.reactions });

  ok(res, { reactions: msg.reactions });
});

exports.forward = asyncHandler(async (req, res) => {
  const { conversationId } = req.body;
  if (!conversationId) throw new ApiError(400, 'conversationId required.');
  const original = await ensureMember(req.params.id, req.user._id);
  const target = await Conversation.findById(conversationId);
  if (!target || !target.participants.some((p) => p.equals(req.user._id))) {
    throw new ApiError(403, 'Cannot forward to that conversation.');
  }
  const copy = await Message.create({
    conversationId, senderId: req.user._id,
    type: original.type, content: original.content, media: original.media,
  });
  target.lastMessage = copy._id;
  target.lastMessageAt = new Date();
  await target.save();

  const io = req.app.get('io');
  if (io) io.to(`conversation:${conversationId}`).emit('message:new', copy);

  ok(res, { message: copy }, 'Forwarded.');
});