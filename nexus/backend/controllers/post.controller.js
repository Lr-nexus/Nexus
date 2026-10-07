const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.feed = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
  const posts = await Post.find({ visibility: 'public' })
    .sort({ createdAt: -1 }).limit(limit)
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { posts });
});

exports.create = asyncHandler(async (req, res) => {
  const post = await Post.create({ authorId: req.user._id, ...req.body });
  created(res, { post });
});

exports.like = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  const has = post.likes.some((u) => u.equals(req.user._id));
  if (has) post.likes.pull(req.user._id); else post.likes.push(req.user._id);
  await post.save();
  ok(res, { likes: post.likes.length, liked: !has });
});