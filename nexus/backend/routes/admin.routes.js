const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.use(requireAuth, requireAdmin);

router.get('/users', ctrl.users);
router.post('/users/:id/suspend', ctrl.suspendUser);
router.post('/users/:id/ban', ctrl.banUser);
router.post('/users/:id/activate', ctrl.activateUser);
router.delete('/users/:id', ctrl.deleteUser);

router.get('/reports', ctrl.reports);
router.put('/reports/:id', ctrl.updateReport);

router.get('/stats', ctrl.stats);
router.get('/analytics', ctrl.analytics);
router.get('/audit-logs', ctrl.auditLogs);

module.exports = router;