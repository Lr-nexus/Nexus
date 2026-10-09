const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SavedPost = require('../models/SavedPost');
const Hashtag = require('../models/Hashtag');
const Follow = require('../models/Follow');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

async function touchHashtags(tags) {
  if (!tags?.length) return;
  for (const tag of tags) {
    await Hashtag.updateOne(
      { tag },
      { $inc: { postsCount: 1 }, $set: { lastUsedAt: new Date() } },
      { upsert: true }
    );
  }
}

// Home feed — posts from people I follow + suggested, NEVER my own
exports.feed = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
  const meId = req.user._id;

  const following = await Follow.find({ followerId: meId }).select('followingId');
  const followingIds = following.map((f) => f.followingId);

  const posts = await Post.find({
    authorId: { $in: followingIds, $ne: meId },
    visibility: { $in: ['public', 'followers'] },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('authorId', 'fullName username profilePicture');

  if (posts.length < limit) {
    const excludeIds = [
      meId,
      ...followingIds,
      ...posts.map((p) => p.authorId?._id || p.authorId),
    ];
    const fill = await Post.find({
      authorId: { $nin: excludeIds },
      visibility: 'public',
    })
      .sort({ createdAt: -1 })
      .limit(limit - posts.length)
      .populate('authorId', 'fullName username profilePicture');
    posts.push(...fill);
  }

  ok(res, { posts });
});

// My posts — for profile
exports.mine = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
  const posts = await Post.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { posts });
});

// Another user's posts
exports.byUser = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
  const posts = await Post.find({ authorId: req.params.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { posts });
});

exports.getOne = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    'authorId',
    'fullName username profilePicture'
  );
  if (!post) throw new ApiError(404, 'Post not found.');
  ok(res, { post });
});

exports.create = asyncHandler(async (req, res) => {
  const {
    type,
    caption = '',
    media = [],
    hashtags = [],
    location = '',
    visibility = 'public',
  } = req.body;

  const post = await Post.create({
    authorId: req.user._id,
    type: type || (media.length ? 'image' : 'text'),
    caption,
    media,
    hashtags,
    location,
    visibility,
  });
  await touchHashtags(hashtags);
  const populated = await post.populate('authorId', 'fullName username profilePicture');
  created(res, { post: populated });
});

exports.remove = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (!post.authorId.equals(req.user._id)) throw new ApiError(403, 'Not allowed.');
  await Post.deleteOne({ _id: post._id });
  await Comment.deleteMany({ postId: post._id });
  await SavedPost.deleteMany({ postId: post._id });
  ok(res, {}, 'Post deleted.');
});

exports.like = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  const has = post.likes.some((u) => u.equals(req.user._id));
  if (has) post.likes.pull(req.user._id);
  else post.likes.push(req.user._id);
  await post.save();
  ok(res, { likes: post.likes.length, liked: !has });
});

exports.save = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  const existing = await SavedPost.findOne({ userId: req.user._id, postId: post._id });
  if (existing) {
    await SavedPost.deleteOne({ _id: existing._id });
    return ok(res, { saved: false });
  }
  await SavedPost.create({ userId: req.user._id, postId: post._id });
  ok(res, { saved: true });
});

exports.comments = asyncHandler(async (req, res) => {
  const list = await Comment.find({ postId: req.params.id, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('authorId', 'fullName username profilePicture');
  ok(res, { comments: list });
});

exports.comment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, 'Comment cannot be empty.');
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  const comment = await Comment.create({
    postId: post._id,
    authorId: req.user._id,
    content: content.trim(),
  });
  post.commentsCount = (post.commentsCount || 0) + 1;
  await post.save();
  const populated = await comment.populate('authorId', 'fullName username profilePicture');
  created(res, { comment: populated });
});