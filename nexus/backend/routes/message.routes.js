const router = require('express').Router();
const ctrl = require('../controllers/message.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.delete('/:id', ctrl.remove);
router.put('/:id', ctrl.edit);
router.post('/:id/react', ctrl.react);
router.post('/:id/forward', ctrl.forward);

module.exports = router;