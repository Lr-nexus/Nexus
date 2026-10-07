const Call = require('../models/Call');
const CallParticipant = require('../models/CallParticipant');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.initiate = asyncHandler(async (req, res) => {
  const { participantIds = [], type = 'audio', conversationId = null } = req.body;
  if (!participantIds.length) throw new ApiError(400, 'participantIds required.');

  const call = await Call.create({
    callerId: req.user._id, type,
    isGroup: participantIds.length > 1,
    conversationId,
  });

  await CallParticipant.create({ callId: call._id, userId: req.user._id, status: 'joined', joinedAt: new Date() });
  await CallParticipant.insertMany(participantIds.map((uid) => ({ callId: call._id, userId: uid })));

  const io = req.app.get('io');
  if (io) {
    for (const uid of participantIds) {
      io.to(`user:${uid}`).emit('call:incoming', {
        callId: call._id, from: req.user._id, type,
      });
    }
  }
  created(res, { call });
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
  if (io) io.to(`user:${call.callerId}`).emit(accepted ? 'call:accepted' : 'call:rejected', { callId: call._id });

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
    .sort({ createdAt: -1 }).limit(50).select('callId');
  const ids = parts.map((p) => p.callId);
  const calls = await Call.find({ _id: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate('callerId', 'fullName username profilePicture');
  ok(res, { calls });
});