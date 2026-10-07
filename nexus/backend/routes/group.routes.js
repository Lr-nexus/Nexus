const router = require('express').Router();
const ctrl = require('../controllers/group.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.post('/:id/members', ctrl.addMembers);
router.delete('/:id/members/:userId', ctrl.removeMember);

module.exports = router;