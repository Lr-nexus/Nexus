const router = require('express').Router();
const ctrl = require('../controllers/hashtag.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/:tag', requireAuth, ctrl.get);

module.exports = router;