const User = require('../models/User');
const Session = require('../models/Session');
const OtpVerification = require('../models/OtpVerification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/ApiResponse');

exports.getMe = asyncHandler(async (req, res) => ok(res, { user: req.user }));

exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ['fullName', 'bio', 'website', 'profilePicture', 'isPrivate'];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  const user = await User.findByIdAndUpdate(req.user._id, { $set: patch }, { new: true });
  ok(res, { user });
});

exports.getUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new ApiError(404, 'User not found.');
  ok(res, { user: u });
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

exports.deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const email = req.user.email;

  await Session.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );

  await OtpVerification.deleteMany({ email });

  await User.deleteOne({ _id: userId });

  ok(res, {}, 'Account deleted.');
});