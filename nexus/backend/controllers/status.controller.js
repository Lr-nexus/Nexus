const Status = require('../models/Status');
const StatusView = require('../models/StatusView');
const Follow = require('../models/Follow');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');
const { addDays } = require('../utils/date');

exports.feed = asyncHandler(async (req, res) => {
  const myFollows = await Follow.find({ followerId: req.user._id }).select('followingId');
  const ids = [req.user._id, ...myFollows.map((f) => f.followingId)];
  const statuses = await Status.find({
    authorId: { $in: ids },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 }).populate('authorId', 'fullName username profilePicture');
  ok(res, { statuses });
});

exports.create = asyncHandler(async (req, res) => {
  const { type = 'text', content = '', media, background, privacy = 'everyone', allowedUsers = [] } = req.body;
  const status = await Status.create({
    authorId: req.user._id, type, content, media, background, privacy, allowedUsers,
    expiresAt: addDays(new Date(), 1),
  });
  created(res, { status });
});

exports.remove = asyncHandler(async (req, res) => {
  const status = await Status.findById(req.params.id);
  if (!status) throw new ApiError(404, 'Status not found.');
  if (!status.authorId.equals(req.user._id)) throw new ApiError(403, 'Not allowed.');
  await Status.deleteOne({ _id: status._id });
  ok(res, {}, 'Status deleted.');
});

exports.view = asyncHandler(async (req, res) => {
  const status = await Status.findById(req.params.id);
  if (!status) throw new ApiError(404, 'Status not found.');
  const existing = await StatusView.findOne({ statusId: status._id, viewerId: req.user._id });
  if (!existing) {
    await StatusView.create({ statusId: status._id, viewerId: req.user._id });
    status.viewsCount += 1;
    await status.save();
  }
  ok(res, { viewsCount: status.viewsCount });
});