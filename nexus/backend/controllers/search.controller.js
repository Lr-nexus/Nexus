const User = require('../models/User');
const Post = require('../models/Post');
const Vibe = require('../models/Vibe');
const Hashtag = require('../models/Hashtag');
const Community = require('../models/Community');
const Channel = require('../models/Channel');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/ApiResponse');

exports.search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return ok(res, { users: [], posts: [], vibes: [], hashtags: [], communities: [], channels: [] });
  const rx = { $regex: q, $options: 'i' };

  const [users, posts, vibes, hashtags, communities, channels] = await Promise.all([
    User.find({ $or: [{ username: rx }, { fullName: rx }] }).limit(10).select('fullName username profilePicture'),
    Post.find({ $or: [{ caption: rx }, { hashtags: q.toLowerCase() }] }).limit(10).populate('authorId', 'fullName username profilePicture'),
    Vibe.find({ $or: [{ caption: rx }, { hashtags: q.toLowerCase() }] }).limit(10).populate('authorId', 'fullName username profilePicture'),
    Hashtag.find({ tag: rx }).limit(10),
    Community.find({ name: rx, isPrivate: false }).limit(10),
    Channel.find({ name: rx, isPrivate: false }).limit(10),
  ]);

  ok(res, { users, posts, vibes, hashtags, communities, channels });
});

exports.trending = asyncHandler(async (req, res) => {
  const hashtags = await Hashtag.find().sort({ postsCount: -1 }).limit(20);
  ok(res, { hashtags });
});