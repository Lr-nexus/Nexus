const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');
const presence = require('../sockets/presence.socket');

function decorate(convo, onlineSet) {
  const obj = convo.toObject ? convo.toObject() : convo;
  obj.participants = (obj.participants || []).map((p) => ({
    ...p,
    isOnline: onlineSet.has(String(p._id)),
  }));
  return obj;
}

exports.list = asyncHandler(async (req, res) => {
  const list = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'fullName username profilePicture lastSeenAt')
    .populate({ path: 'lastMessage', select: 'content type createdAt senderId' });

  const onlineSet = new Set(presence.getOnlineUsers().map(String));
  const decorated = list.map((c) => decorate(c, onlineSet));
  ok(res, { conversations: decorated });
});

exports.create = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) throw new ApiError(400, 'participantId required.');

  const existing = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.user._id, participantId], $size: 2 },
  }).populate('participants', 'fullName username profilePicture lastSeenAt');

  const onlineSet = new Set(presence.getOnlineUsers().map(String));

  if (existing) return ok(res, { conversation: decorate(existing, onlineSet) });

  const convo = await Conversation.create({
    type: 'direct',
    participants: [req.user._id, participantId],
  });

  const populated = await convo.populate('participants', 'fullName username profilePicture lastSeenAt');
  created(res, { conversation: decorate(populated, onlineSet) });
});

exports.messages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const convo = await Conversation.findById(id);
  if (!convo || !convo.participants.some((p) => p.equals(req.user._id)))
    throw new ApiError(403, 'Not allowed.');

  const list = await Message.find({ conversationId: id, isDeleted: false })
    .sort({ createdAt: 1 })
    .limit(parseInt(req.query.limit || '50', 10));

  ok(res, { messages: list });
});

exports.send = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, type = 'text', media } = req.body;

  const convo = await Conversation.findById(id);
  if (!convo || !convo.participants.some((p) => p.equals(req.user._id)))
    throw new ApiError(403, 'Not allowed.');

  const msg = await Message.create({
    conversationId: id,
    senderId: req.user._id,
    type,
    content,
    media,
  });

  convo.lastMessage = msg._id;
  convo.lastMessageAt = new Date();
  await convo.save();

  const io = req.app.get('io');
  if (io) {
    // Emit to conversation room AND each participant's user room
    io.to(`conversation:${id}`).emit('message:new', msg);
    convo.participants.forEach((pid) => {
      if (!pid.equals(req.user._id)) {
        io.to(`user:${pid}`).emit('message:new', msg);
      }
    });
  }

  created(res, { message: msg });
});