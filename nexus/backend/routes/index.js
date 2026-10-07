const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/posts', require('./post.routes'));
router.use('/stories', require('./story.routes'));
router.use('/statuses', require('./status.routes'));
router.use('/conversations', require('./conversation.routes'));
router.use('/messages', require('./message.routes'));
router.use('/groups', require('./group.routes'));
router.use('/communities', require('./community.routes'));
router.use('/channels', require('./channel.routes'));
router.use('/polls', require('./poll.routes'));
router.use('/vibes', require('./vibe.routes'));
router.use('/calls', require('./call.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/search', require('./search.routes'));
router.use('/hashtags', require('./hashtag.routes'));
router.use('/rizz', require('./rizz.routes'));
router.use('/nova-ai', require('./novaAI.routes'));
router.use('/reports', require('./report.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;