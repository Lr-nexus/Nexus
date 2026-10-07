const router = require('express').Router();
const ctrl = require('../controllers/post.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, ctrl.feed);
router.post('/', requireAuth, ctrl.create);
router.post('/:id/like', requireAuth, ctrl.like);

module.exports = router;