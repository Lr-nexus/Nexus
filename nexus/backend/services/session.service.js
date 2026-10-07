const Session = require('../models/Session');
const { sha256 } = require('../utils/hash');
const logger = require('../utils/logger');

exports.touch = async (sessionId) => {
  await Session.findByIdAndUpdate(sessionId, { lastActiveAt: new Date() });
};

exports.revoke = async (sessionId) => {
  await Session.findByIdAndUpdate(sessionId, { revokedAt: new Date() });
};

exports.revokeAllForUser = async (userId) => {
  await Session.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
};

exports.isRefreshValid = async (sessionId, refreshToken) => {
  const s = await Session.findById(sessionId);
  if (!s || s.revokedAt) return false;
  return s.refreshTokenHash === sha256(refreshToken);
};

exports.cleanupStale = async () => {
  const { deletedCount } = await Session.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revokedAt: { $ne: null, $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    ],
  });
  if (deletedCount) logger.info(`Cleaned ${deletedCount} stale sessions`);
};