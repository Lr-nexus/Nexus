const router = require('express').Router();
const ctrl = require('../controllers/story.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.get('/', ctrl.feed);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);
router.post('/:id/view', ctrl.view);
router.post('/:id/react', ctrl.react);

module.exports = router;