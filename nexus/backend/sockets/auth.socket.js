const { verifyAccess } = require('../services/token.service');
const logger = require('../utils/logger');

module.exports = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No auth token'));
    const decoded = verifyAccess(token);
    socket.userId = decoded.sub;
    socket.sessionId = decoded.sid;
    next();
  } catch (e) {
    logger.warn('Socket auth failed:', e.message);
    next(new Error('Unauthorized'));
  }
};