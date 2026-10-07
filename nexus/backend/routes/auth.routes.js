const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { otpLimiter } = require('../middleware/rateLimit.middleware');
const v = require('../validators/auth.validator');

router.post('/register', validate(v.registerSchema), ctrl.register);
router.post('/login', ctrl.login);
router.post('/request-otp', otpLimiter, validate(v.requestOtpSchema), ctrl.requestOtp);
router.post('/verify-otp', otpLimiter, validate(v.verifyOtpSchema), ctrl.verifyOtp);
router.post('/resend-otp', otpLimiter, validate(v.requestOtpSchema), ctrl.resendOtp);
router.post('/reset-password', ctrl.resetPassword);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/logout-all', requireAuth, ctrl.logoutAll);
router.get('/me', requireAuth, ctrl.me);
router.get('/sessions', requireAuth, ctrl.sessions);
router.delete('/sessions/:id', requireAuth, ctrl.revokeSession);

module.exports = router;