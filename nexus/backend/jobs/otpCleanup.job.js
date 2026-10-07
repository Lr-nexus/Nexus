const OtpVerification = require('../models/OtpVerification');
const logger = require('../utils/logger');

module.exports = function startOtpCleanup(intervalMs = 60 * 60 * 1000) {
  async function run() {
    try {
      const { deletedCount } = await OtpVerification.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { verifiedAt: { $ne: null } },
        ],
      });
      if (deletedCount) logger.info(`OTP cleanup: removed ${deletedCount}`);
    } catch (e) {
      logger.error('OTP cleanup failed:', e.message);
    }
  }
  run();
  setInterval(run, intervalMs);
};