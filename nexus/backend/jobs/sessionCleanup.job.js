const Session = require('../models/Session');
const logger = require('../utils/logger');

module.exports = function startSessionCleanup(intervalMs = 24 * 60 * 60 * 1000) {
  async function run() {
    try {
      const { deletedCount } = await Session.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { revokedAt: { $ne: null, $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      });
      if (deletedCount) logger.info(`Session cleanup: removed ${deletedCount}`);
    } catch (e) {
      logger.error('Session cleanup failed:', e.message);
    }
  }
  run();
  setInterval(run, intervalMs);
};