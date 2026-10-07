const Status = require('../models/Status');
const logger = require('../utils/logger');

module.exports = function startStatusCleanup(intervalMs = 30 * 60 * 1000) {
  async function run() {
    try {
      const { deletedCount } = await Status.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      if (deletedCount) logger.info(`Status cleanup: removed ${deletedCount}`);
    } catch (e) {
      logger.error('Status cleanup failed:', e.message);
    }
  }
  run();
  setInterval(run, intervalMs);
};