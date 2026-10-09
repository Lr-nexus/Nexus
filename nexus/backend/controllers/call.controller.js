const mongoose = require('mongoose');
const Call = require('../models/Call');
const CallParticipant = require('../models/CallParticipant');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.initiate = asyncHandler(async (req, res) => {
  const { type = 'audio', conversationId = null } = req.body;
  let { participantIds = [] } = req.body;

  // Fallback: if conversationId given, derive participants
  if ((!participantIds || participantIds.length === 0) && conversationId) {
    const convo = await Conversation.findById(conversationId);
    if (convo) {
      participantIds = convo.participants
        .map((p) => String(p))
        .filter((id) => id !== String(req.user._id));
    }
  }

  // Validate — must be non-empty array of valid ObjectIds, excluding self
  participantIds = (participantIds || [])
    .map((id) => String(id))
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .filter((id) => id !== String(req.user._id));

  if (participantIds.length === 0) {
    throw new ApiError(400, 'No valid participants for this call.');
  }

  const call = await Call.create({
    callerId: req.user._id,
    type,
    isGroup: participantIds.length > 1,
    conversationId,
  });

  await CallParticipant.create({
    callId: call._id,
    userId: req.user._id,
    status: 'joined',
    joinedAt: new Date(),
  });

  await CallParticipant.insertMany(
    participantIds.map((uid) => ({ callId: call._id, userId: uid }))
  );

  const io = req.app.get('io');
  if (io) {
    for (const uid of participantIds) {
      io.to(`user:${uid}`).emit('call:incoming', {
        callId: call._id,
        from: {
          _id: req.user._id,
          fullName: req.user.fullName,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
        type,
      });
    }
  }

  created(res, { call, participantIds });
});

exports.answer = asyncHandler(async (req, res) => {
  const { accepted } = req.body;
  const call = await Call.findById(req.params.id);
  if (!call) throw new ApiError(404, 'Call not found.');

  const p = await CallParticipant.findOne({ callId: call._id, userId: req.user._id });
  if (!p) throw new ApiError(403, 'Not a participant.');

  if (accepted) {
    p.status = 'joined';
    p.joinedAt = new Date();
    call.status = 'ongoing';
  } else {
    p.status = 'rejected';
    call.status = 'rejected';
    call.endedAt = new Date();
  }
  await p.save();
  await call.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${call.callerId}`).emit(
      accepted ? 'call:accepted' : 'call:rejected',
      { callId: call._id }
    );
  }
  ok(res, { call });
});

exports.end = asyncHandler(async (req, res) => {
  const call = await Call.findById(req.params.id);
  if (!call) throw new ApiError(404, 'Call not found.');
  call.status = 'ended';
  call.endedAt = new Date();
  call.durationSeconds = Math.round((call.endedAt - call.startedAt) / 1000);
  await call.save();

  await CallParticipant.updateMany(
    { callId: call._id, status: 'joined' },
    { $set: { status: 'left', leftAt: new Date() } }
  );

  const io = req.app.get('io');
  if (io) io.to(`call:${call._id}`).emit('call:ended', { callId: call._id });
  ok(res, { call });
});

exports.history = asyncHandler(async (req, res) => {
  const parts = await CallParticipant.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('callId');
  const ids = parts.map((p) => p.callId);
  const calls = await Call.find({ _id: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate('callerId', 'fullName username profilePicture');
  ok(res, { calls });
});