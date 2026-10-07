const Channel = require('../models/Channel');
const ChannelMember = require('../models/ChannelMember');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.list = asyncHandler(async (req, res) => {
  const list = await Channel.find({ isPrivate: false }).sort({ subscribersCount: -1 }).limit(50);
  ok(res, { channels: list });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, description = '', photo = '', isPrivate = false, communityId = null } = req.body;
  if (!name) throw new ApiError(400, 'Name required.');
  const channel = await Channel.create({
    name, description, photo, isPrivate, ownerId: req.user._id, communityId, subscribersCount: 1,
  });
  await ChannelMember.create({ channelId: channel._id, userId: req.user._id, role: 'owner' });
  created(res, { channel });
});

exports.get = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id).populate('ownerId', 'fullName username profilePicture');
  if (!channel) throw new ApiError(404, 'Channel not found.');
  ok(res, { channel });
});

exports.follow = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) throw new ApiError(404, 'Channel not found.');
  const existing = await ChannelMember.findOne({ channelId: channel._id, userId: req.user._id });
  if (existing) return ok(res, {}, 'Already subscribed.');
  await ChannelMember.create({ channelId: channel._id, userId: req.user._id });
  channel.subscribersCount += 1;
  await channel.save();
  ok(res, {}, 'Subscribed.');
});

exports.unfollow = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) throw new ApiError(404, 'Channel not found.');
  const m = await ChannelMember.findOne({ channelId: channel._id, userId: req.user._id });
  if (!m) return ok(res, {}, 'Not subscribed.');
  if (m.role === 'owner') throw new ApiError(403, 'Owner cannot unsubscribe.');
  await ChannelMember.deleteOne({ _id: m._id });
  channel.subscribersCount = Math.max(0, channel.subscribersCount - 1);
  await channel.save();
  ok(res, {}, 'Unsubscribed.');
});