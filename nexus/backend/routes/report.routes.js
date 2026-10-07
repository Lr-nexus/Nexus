const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.post('/', ctrl.create);
router.get('/mine', ctrl.myReports);

module.exports = router;