const router = require('express').Router();
const ctrl = require('../controllers/channel.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.post('/:id/follow', ctrl.follow);
router.post('/:id/unfollow', ctrl.unfollow);

module.exports = router;