const startOtpCleanup = require('./otpCleanup.job');
const startSessionCleanup = require('./sessionCleanup.job');
const startStoryCleanup = require('./storyCleanup.job');
const startStatusCleanup = require('./statusCleanup.job');
const logger = require('../utils/logger');

module.exports = function startJobs() {
  if (process.env.NODE_ENV === 'test') return;
  logger.info('Starting background jobs');
  startOtpCleanup();
  startSessionCleanup();
  startStoryCleanup();
  startStatusCleanup();
};