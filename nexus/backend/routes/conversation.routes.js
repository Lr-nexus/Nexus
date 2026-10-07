const router = require('express').Router();
const ctrl = require('../controllers/conversation.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id/messages', ctrl.messages);
router.post('/:id/messages', ctrl.send);

module.exports = router;