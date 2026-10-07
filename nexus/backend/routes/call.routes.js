const router = require('express').Router();
const ctrl = require('../controllers/call.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.post('/', ctrl.initiate);
router.post('/:id/answer', ctrl.answer);
router.post('/:id/end', ctrl.end);
router.get('/history', ctrl.history);

module.exports = router;