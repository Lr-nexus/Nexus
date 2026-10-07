const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.list = asyncHandler(async (req, res) => {
  const list = await Community.find({ isPrivate: false })
    .sort({ membersCount: -1 })
    .limit(50);
  ok(res, { communities: list });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, description = '', photo = '', cover = '', isPrivate = false } = req.body;
  if (!name) throw new ApiError(400, 'Name required.');
  const community = await Community.create({
    name, description, photo, cover, isPrivate,
    ownerId: req.user._id,
    membersCount: 1,
  });
  await CommunityMember.create({
    communityId: community._id,
    userId: req.user._id,
    role: 'owner',
  });
  created(res, { community });
});

exports.get = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id)
    .populate('ownerId', 'fullName username profilePicture');
  if (!community) throw new ApiError(404, 'Community not found.');
  const members = await CommunityMember.find({ communityId: community._id })
    .populate('userId', 'fullName username profilePicture');
  ok(res, { community, members });
});

exports.join = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw new ApiError(404, 'Community not found.');
  const existing = await CommunityMember.findOne({
    communityId: community._id,
    userId: req.user._id,
  });
  if (existing) return ok(res, {}, 'Already a member.');
  await CommunityMember.create({ communityId: community._id, userId: req.user._id });
  community.membersCount += 1;
  await community.save();
  ok(res, {}, 'Joined.');
});

exports.leave = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw new ApiError(404, 'Community not found.');
  const m = await CommunityMember.findOne({
    communityId: community._id,
    userId: req.user._id,
  });
  if (!m) return ok(res, {}, 'Not a member.');
  if (m.role === 'owner') throw new ApiError(403, 'Owner cannot leave.');
  await CommunityMember.deleteOne({ _id: m._id });
  community.membersCount = Math.max(0, community.membersCount - 1);
  await community.save();
  ok(res, {}, 'Left.');
});