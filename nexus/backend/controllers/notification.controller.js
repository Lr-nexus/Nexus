const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/ApiResponse');

exports.list = asyncHandler(async (req, res) => {
  const list = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 }).limit(50)
    .populate('fromUserId', 'fullName username profilePicture');
  ok(res, { notifications: list });
});

exports.markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { readAt: new Date() }
  );
  ok(res, {}, 'Marked read.');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, readAt: null }, { readAt: new Date() });
  ok(res, {}, 'All marked read.');
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user._id, readAt: null });
  ok(res, { count });
});