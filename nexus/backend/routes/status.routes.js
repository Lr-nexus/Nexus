const router = require('express').Router();
const ctrl = require('../controllers/status.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.get('/', ctrl.feed);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);
router.post('/:id/view', ctrl.view);

module.exports = router;