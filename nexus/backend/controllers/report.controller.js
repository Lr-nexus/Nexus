const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.create = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description = '' } = req.body;
  if (!targetType || !targetId || !reason) throw new ApiError(400, 'targetType, targetId, reason required.');
  const report = await Report.create({ reporterId: req.user._id, targetType, targetId, reason, description });
  created(res, { report }, 'Report submitted.');
});

exports.myReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 });
  ok(res, { reports });
});