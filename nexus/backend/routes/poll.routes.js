const router = require('express').Router();
const ctrl = require('../controllers/poll.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.post('/:id/vote', ctrl.vote);
router.post('/:id/close', ctrl.close);

module.exports = router;