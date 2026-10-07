const router = require('express').Router();
const ctrl = require('../controllers/search.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, ctrl.search);
router.get('/trending', requireAuth, ctrl.trending);

module.exports = router;