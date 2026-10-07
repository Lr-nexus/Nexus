const router = require('express').Router();
const ctrl = require('../controllers/novaAI.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');

router.use(requireAuth, aiLimiter);
router.post('/chat', ctrl.chat);
router.post('/summarize', ctrl.summarize);

module.exports = router;