const User = require('../models/User');
const Session = require('../models/Session');
const OtpVerification = require('../models/OtpVerification');
const Follow = require('../models/Follow');
const FollowRequest = require('../models/FollowRequest');
const Block = require('../models/Block');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/ApiResponse');

async function decorateCounts(userDoc) {
  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ followingId: userDoc._id }),
    Follow.countDocuments({ followerId: userDoc._id }),
  ]);
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  obj.followersCount = followersCount;
  obj.followingCount = followingCount;
  return obj;
}

exports.getMe = asyncHandler(async (req, res) => {
  const user = await decorateCounts(req.user);
  ok(res, { user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ['fullName', 'bio', 'website', 'profilePicture', 'isPrivate'];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  const user = await User.findByIdAndUpdate(req.user._id, { $set: patch }, { new: true });
  const decorated = await decorateCounts(user);
  ok(res, { user: decorated });
});

exports.getUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new ApiError(404, 'User not found.');
  const decorated = await decorateCounts(u);
  ok(res, { user: decorated });
});

exports.search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return ok(res, { users: [] });
  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { fullName: { $regex: q, $options: 'i' } },
    ],
  }).limit(20);
  ok(res, { users });
});

// ─── Follow system ───────────────────────────────────
exports.follow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === String(req.user._id)) {
    throw new ApiError(400, 'You cannot follow yourself.');
  }
  const target = await User.findById(targetId);
  if (!target) throw new ApiError(404, 'User not found.');

  const blocked = await Block.findOne({
    $or: [
      { blockerId: req.user._id, blockedId: targetId },
      { blockerId: targetId, blockedId: req.user._id },
    ],
  });
  if (blocked) throw new ApiError(403, 'Cannot follow this user.');

  const existing = await Follow.findOne({
    followerId: req.user._id,
    followingId: targetId,
  });
  if (existing) return ok(res, { following: true, requested: false }, 'Already following.');

  if (target.isPrivate) {
    const existingReq = await FollowRequest.findOne({
      fromUserId: req.user._id,
      toUserId: targetId,
      status: 'pending',
    });
    if (existingReq) {
      return ok(res, { following: false, requested: true }, 'Request already sent.');
    }
    await FollowRequest.create({
      fromUserId: req.user._id,
      toUserId: targetId,
      status: 'pending',
    });
    try {
      await Notification.create({
        userId: targetId,
        type: 'follow_request',
        title: 'New follow request',
        body: `${req.user.fullName} wants to follow you`,
        fromUserId: req.user._id,
      });
    } catch {}
    return ok(res, { following: false, requested: true }, 'Follow request sent.');
  }

  await Follow.create({
    followerId: req.user._id,
    followingId: targetId,
  });

  try {
    await Notification.create({
      userId: targetId,
      type: 'follow',
      title: 'New follower',
      body: `${req.user.fullName} started following you`,
      fromUserId: req.user._id,
    });
  } catch {}

  ok(res, { following: true, requested: false }, 'Following.');
});

exports.unfollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  await Follow.deleteOne({ followerId: req.user._id, followingId: targetId });
  await FollowRequest.deleteMany({
    fromUserId: req.user._id,
    toUserId: targetId,
    status: 'pending',
  });
  ok(res, { following: false, requested: false }, 'Unfollowed.');
});

exports.followStatus = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const [following, requested, followersCount, followingCount] = await Promise.all([
    Follow.findOne({ followerId: req.user._id, followingId: targetId }),
    FollowRequest.findOne({ fromUserId: req.user._id, toUserId: targetId, status: 'pending' }),
    Follow.countDocuments({ followingId: targetId }),
    Follow.countDocuments({ followerId: targetId }),
  ]);
  ok(res, {
    following: !!following,
    requested: !!requested,
    followersCount,
    followingCount,
  });
});

exports.followers = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const rows = await Follow.find({ followingId: userId })
    .populate('followerId', 'fullName username profilePicture bio')
    .limit(200);
  ok(res, { followers: rows.map((r) => r.followerId).filter(Boolean) });
});

exports.following = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const rows = await Follow.find({ followerId: userId })
    .populate('followingId', 'fullName username profilePicture bio')
    .limit(200);
  ok(res, { following: rows.map((r) => r.followingId).filter(Boolean) });
});

exports.followRequests = asyncHandler(async (req, res) => {
  const rows = await FollowRequest.find({
    toUserId: req.user._id,
    status: 'pending',
  })
    .populate('fromUserId', 'fullName username profilePicture bio')
    .sort({ createdAt: -1 });
  ok(res, { requests: rows });
});

exports.acceptFollowRequest = asyncHandler(async (req, res) => {
  const fr = await FollowRequest.findById(req.params.id);
  if (!fr) throw new ApiError(404, 'Request not found.');
  if (String(fr.toUserId) !== String(req.user._id)) {
    throw new ApiError(403, 'Not allowed.');
  }
  fr.status = 'accepted';
  await fr.save();

  const exists = await Follow.findOne({
    followerId: fr.fromUserId,
    followingId: fr.toUserId,
  });
  if (!exists) {
    await Follow.create({
      followerId: fr.fromUserId,
      followingId: fr.toUserId,
    });
  }

  try {
    await Notification.create({
      userId: fr.fromUserId,
      type: 'follow_accepted',
      title: 'Follow request accepted',
      body: `${req.user.fullName} accepted your follow request`,
      fromUserId: req.user._id,
    });
  } catch {}

  ok(res, {}, 'Accepted.');
});

exports.rejectFollowRequest = asyncHandler(async (req, res) => {
  const fr = await FollowRequest.findById(req.params.id);
  if (!fr) throw new ApiError(404, 'Request not found.');
  if (String(fr.toUserId) !== String(req.user._id)) {
    throw new ApiError(403, 'Not allowed.');
  }
  fr.status = 'rejected';
  await fr.save();
  ok(res, {}, 'Rejected.');
});

exports.removeFollower = asyncHandler(async (req, res) => {
  const followerId = req.params.userId;
  await Follow.deleteOne({ followerId, followingId: req.user._id });
  ok(res, {}, 'Follower removed.');
});

exports.deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const email = req.user.email;
  await Session.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
  await OtpVerification.deleteMany({ email });
  await Follow.deleteMany({ $or: [{ followerId: userId }, { followingId: userId }] });
  await FollowRequest.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] });
  await User.deleteOne({ _id: userId });
  ok(res, {}, 'Account deleted.');
});