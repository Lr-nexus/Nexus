const Hashtag = require('../models/Hashtag');
const Post = require('../models/Post');
const Vibe = require('../models/Vibe');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/ApiResponse');

exports.get = asyncHandler(async (req, res) => {
  const tag = String(req.params.tag || '').toLowerCase();
  const [hashtag, posts, vibes] = await Promise.all([
    Hashtag.findOne({ tag }),
    Post.find({ hashtags: tag })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('authorId', 'fullName username profilePicture'),
    Vibe.find({ hashtags: tag })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('authorId', 'fullName username profilePicture'),
  ]);
  ok(res, {
    hashtag: hashtag || { tag, postsCount: posts.length, vibesCount: vibes.length },
    posts,
    vibes,
  });
});