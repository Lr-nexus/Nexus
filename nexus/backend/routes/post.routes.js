const router = require('express').Router();
const ctrl = require('../controllers/post.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', ctrl.feed);
router.get('/mine', ctrl.mine);
router.get('/user/:userId', ctrl.byUser);
router.post('/', ctrl.create);

router.get('/:id', ctrl.getOne);
router.delete('/:id', ctrl.remove);
router.post('/:id/like', ctrl.like);
router.post('/:id/save', ctrl.save);

router.get('/:id/comments', ctrl.comments);
router.post('/:id/comments', ctrl.comment);

module.exports = router;