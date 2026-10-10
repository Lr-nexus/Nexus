const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/me', ctrl.getMe);
router.put('/me', ctrl.updateMe);
router.delete('/me', ctrl.deleteMe);

router.get('/search', ctrl.search);

router.get('/follow-requests/pending', ctrl.followRequests);
router.post('/follow-requests/:id/accept', ctrl.acceptFollowRequest);
router.post('/follow-requests/:id/reject', ctrl.rejectFollowRequest);

router.delete('/followers/:userId', ctrl.removeFollower);

router.post('/:id/follow', ctrl.follow);
router.delete('/:id/follow', ctrl.unfollow);
router.get('/:id/follow-status', ctrl.followStatus);
router.get('/:id/followers', ctrl.followers);
router.get('/:id/following', ctrl.following);

// Catch-all — MUST be last
router.get('/:id', ctrl.getUser);

module.exports = router;