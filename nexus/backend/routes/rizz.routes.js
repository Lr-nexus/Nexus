const router = require('express').Router();
const ctrl = require('../controllers/rizz.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const v = require('../validators/rizz.validator');

router.use(requireAuth, aiLimiter);

router.post('/chat', validate(v.chatSchema), ctrl.chat);
router.post('/reply', validate(v.replySchema), ctrl.reply);
router.post('/rewrite', validate(v.rewriteSchema), ctrl.rewrite);
router.post('/compliment', validate(v.complimentSchema), ctrl.compliment);
router.post('/conversation-starter', validate(v.starterSchema), ctrl.conversationStarter);
router.post('/rescue', validate(v.rescueSchema), ctrl.rescue);

router.get('/saved', ctrl.saved);
router.post('/saved', ctrl.saveResponse);
router.delete('/saved/:id', ctrl.deleteSaved);

router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);

router.get('/history', ctrl.history);
router.delete('/history/:id', ctrl.deleteHistory);

module.exports = router;