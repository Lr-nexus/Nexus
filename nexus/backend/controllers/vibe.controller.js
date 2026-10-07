const Vibe = require('../models/Vibe');
const VibeLike = require('../models/VibeLike');
const VibeComment = require('../models/VibeComment');
const VibeView = require('../models/VibeView');
const VibeSave = require('../models/VibeSave');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.feed = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 30);
  const vibes = await Vibe.find({ visibility: 'public' })
    .sort({ createdAt: -1 }).limit(limit)
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { vibes });
});

exports.create = asyncHandler(async (req, res) => {
  const { videoUrl, publicId = '', thumbnail = '', caption = '', hashtags = [], mentions = [], music, durationSeconds = 0, visibility = 'public' } = req.body;
  if (!videoUrl) throw new ApiError(400, 'videoUrl required.');
  const vibe = await Vibe.create({
    authorId: req.user._id, videoUrl, publicId, thumbnail, caption,
    hashtags, mentions, music, durationSeconds, visibility,
  });
  created(res, { vibe });
});

exports.get = asyncHandler(async (req, res) => {
  const vibe = await Vibe.findById(req.params.id).populate('authorId', 'fullName username profilePicture');
  if (!vibe) throw new ApiError(404, 'Vibe not found.');
  ok(res, { vibe });
});

exports.like = asyncHandler(async (req, res) => {
  const vibe = await Vibe.findById(req.params.id);
  if (!vibe) throw new ApiError(404, 'Vibe not found.');
  const existing = await VibeLike.findOne({ vibeId: vibe._id, userId: req.user._id });
  if (existing) {
    await VibeLike.deleteOne({ _id: existing._id });
    vibe.likesCount = Math.max(0, vibe.likesCount - 1);
  } else {
    await VibeLike.create({ vibeId: vibe._id, userId: req.user._id });
    vibe.likesCount += 1;
  }
  await vibe.save();
  ok(res, { likesCount: vibe.likesCount, liked: !existing });
});

exports.save = asyncHandler(async (req, res) => {
  const vibe = await Vibe.findById(req.params.id);
  if (!vibe) throw new ApiError(404, 'Vibe not found.');
  const existing = await VibeSave.findOne({ vibeId: vibe._id, userId: req.user._id });
  if (existing) {
    await VibeSave.deleteOne({ _id: existing._id });
    return ok(res, { saved: false });
  }
  await VibeSave.create({ vibeId: vibe._id, userId: req.user._id });
  ok(res, { saved: true });
});

exports.view = asyncHandler(async (req, res) => {
  const vibe = await Vibe.findById(req.params.id);
  if (!vibe) throw new ApiError(404, 'Vibe not found.');
  await VibeView.create({ vibeId: vibe._id, userId: req.user._id, watchSeconds: req.body.watchSeconds || 0 });
  vibe.viewsCount += 1;
  await vibe.save();
  ok(res, { viewsCount: vibe.viewsCount });
});

exports.comments = asyncHandler(async (req, res) => {
  const list = await VibeComment.find({ vibeId: req.params.id, isDeleted: false })
    .sort({ createdAt: -1 }).limit(50)
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { comments: list });
});

exports.comment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, 'content required.');
  const vibe = await Vibe.findById(req.params.id);
  if (!vibe) throw new ApiError(404, 'Vibe not found.');
  const comment = await VibeComment.create({ vibeId: vibe._id, authorId: req.user._id, content });
  vibe.commentsCount += 1;
  await vibe.save();
  created(res, { comment });
});