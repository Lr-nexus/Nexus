const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, ctrl.getMe);
router.put('/me', requireAuth, ctrl.updateMe);
router.delete('/me', requireAuth, ctrl.deleteMe);
router.get('/search', requireAuth, ctrl.search);
router.get('/:id', requireAuth, ctrl.getUser);

module.exports = router;