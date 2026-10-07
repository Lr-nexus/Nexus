const Story = require('../models/Story');
const StoryView = require('../models/StoryView');
const StoryReaction = require('../models/StoryReaction');
const Follow = require('../models/Follow');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');
const { addDays } = require('../utils/date');

exports.feed = asyncHandler(async (req, res) => {
  const myFollows = await Follow.find({ followerId: req.user._id }).select('followingId');
  const ids = [req.user._id, ...myFollows.map((f) => f.followingId)];
  const stories = await Story.find({
    authorId: { $in: ids },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { stories });
});

exports.create = asyncHandler(async (req, res) => {
  const { type = 'image', media, text, textStyle, stickers, music, privacy = 'everyone', allowedUsers = [], hiddenFrom = [] } = req.body;
  if (type === 'text' && !text) throw new ApiError(400, 'Text story requires text.');
  if (type !== 'text' && !media?.url) throw new ApiError(400, 'Media story requires a media URL.');

  const story = await Story.create({
    authorId: req.user._id, type, media, text, textStyle, stickers, music,
    privacy, allowedUsers, hiddenFrom,
    expiresAt: addDays(new Date(), 1),
  });
  created(res, { story });
});

exports.remove = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) throw new ApiError(404, 'Story not found.');
  if (!story.authorId.equals(req.user._id)) throw new ApiError(403, 'Not allowed.');
  await Story.deleteOne({ _id: story._id });
  ok(res, {}, 'Story deleted.');
});

exports.view = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) throw new ApiError(404, 'Story not found.');
  const existing = await StoryView.findOne({ storyId: story._id, viewerId: req.user._id });
  if (!existing) {
    await StoryView.create({ storyId: story._id, viewerId: req.user._id });
    story.viewsCount += 1;
    await story.save();
  }
  ok(res, { viewsCount: story.viewsCount });
});

exports.react = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) throw new ApiError(400, 'emoji required.');
  const story = await Story.findById(req.params.id);
  if (!story) throw new ApiError(404, 'Story not found.');

  const existing = await StoryReaction.findOne({ storyId: story._id, userId: req.user._id });
  if (existing) {
    existing.emoji = emoji;
    await existing.save();
  } else {
    await StoryReaction.create({ storyId: story._id, userId: req.user._id, emoji });
    story.reactionsCount += 1;
    await story.save();
  }
  ok(res, { emoji });
});