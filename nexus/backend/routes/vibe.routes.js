const router = require('express').Router();
const ctrl = require('../controllers/vibe.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, ctrl.feed);
router.post('/', requireAuth, ctrl.create);
router.get('/:id', requireAuth, ctrl.get);
router.post('/:id/like', requireAuth, ctrl.like);
router.post('/:id/save', requireAuth, ctrl.save);
router.post('/:id/view', requireAuth, ctrl.view);
router.get('/:id/comments', requireAuth, ctrl.comments);
router.post('/:id/comments', requireAuth, ctrl.comment);

module.exports = router;