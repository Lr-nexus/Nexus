const router = require('express').Router();
const ctrl = require('../controllers/community.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.post('/:id/join', ctrl.join);
router.post('/:id/leave', ctrl.leave);

module.exports = router;