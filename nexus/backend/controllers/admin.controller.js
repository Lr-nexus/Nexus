const User = require('../models/User');
const Post = require('../models/Post');
const Vibe = require('../models/Vibe');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');
const Community = require('../models/Community');
const Channel = require('../models/Channel');
const Report = require('../models/Report');
const AIUsage = require('../models/AIUsage');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/ApiResponse');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function audit(req, action, targetType, targetId, metadata = {}) {
  await AuditLog.create({
    actorId: req.user._id, action, targetType, targetId, metadata,
    ipAddress: req.ip, userAgent: req.headers['user-agent'] || '',
  });
}

exports.users = asyncHandler(async (req, res) => {
  const { limit, page } = parsePagination(req.query);
  const q = (req.query.q || '').trim();
  const filter = q ? { $or: [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }, { fullName: { $regex: q, $options: 'i' } }] } : {};
  const results = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await User.countDocuments(filter);
  ok(res, { users: results, total, ...buildMeta({ limit, results }) });
});

exports.suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
  if (!user) throw new ApiError(404, 'User not found.');
  await audit(req, 'user_suspend', 'user', user._id);
  ok(res, { user });
});

exports.banUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true });
  if (!user) throw new ApiError(404, 'User not found.');
  await audit(req, 'user_ban', 'user', user._id);
  ok(res, { user });
});

exports.activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
  if (!user) throw new ApiError(404, 'User not found.');
  await audit(req, 'user_activate', 'user', user._id);
  ok(res, { user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  await audit(req, 'user_delete', 'user', user._id);
  ok(res, {}, 'User deleted.');
});

exports.reports = asyncHandler(async (req, res) => {
  const { limit, page } = parsePagination(req.query);
  const status = req.query.status;
  const filter = status ? { status } : {};
  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(limit)
    .populate('reporterId', 'fullName username profilePicture');
  const total = await Report.countDocuments(filter);
  ok(res, { reports, total });
});

exports.updateReport = asyncHandler(async (req, res) => {
  const { status, action, notes = '' } = req.body;
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, action, notes, reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!report) throw new ApiError(404, 'Report not found.');
  await audit(req, 'report_update', 'report', report._id, { status, action });
  ok(res, { report });
});

exports.stats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalPosts, totalVibes, totalMessages, totalGroups, totalCommunities, totalChannels, pendingReports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    Post.countDocuments(),
    Vibe.countDocuments(),
    Message.countDocuments(),
    Group.countDocuments(),
    Community.countDocuments(),
    Channel.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
  ]);
  ok(res, { totalUsers, activeUsers, totalPosts, totalVibes, totalMessages, totalGroups, totalCommunities, totalChannels, pendingReports });
});

exports.analytics = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [newUsers, aiRequests] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: since } }),
    AIUsage.countDocuments({ createdAt: { $gte: since } }),
  ]);
  ok(res, { last30Days: { newUsers, aiRequests } });
});

exports.auditLogs = asyncHandler(async (req, res) => {
  const { limit, page } = parsePagination(req.query);
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(limit)
    .populate('actorId', 'fullName username');
  ok(res, { logs });
});