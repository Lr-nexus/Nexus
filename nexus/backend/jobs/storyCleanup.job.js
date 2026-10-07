const Story = require('../models/Story');
const logger = require('../utils/logger');

module.exports = function startStoryCleanup(intervalMs = 30 * 60 * 1000) {
  async function run() {
    try {
      const { deletedCount } = await Story.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      if (deletedCount) logger.info(`Story cleanup: removed ${deletedCount}`);
    } catch (e) {
      logger.error('Story cleanup failed:', e.message);
    }
  }
  run();
  setInterval(run, intervalMs);
};