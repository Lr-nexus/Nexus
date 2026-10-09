const User = require('../models/User');
const logger = require('../utils/logger');

// In-memory presence store (single-instance only — move to Redis for multi-node)
const onlineUsers = new Map(); // userId -> Set of socketIds

function markOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
  return onlineUsers.get(userId).size === 1;
}

function markOffline(userId, socketId) {
  const set = onlineUsers.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
}

module.exports = (io, socket) => {
  const becameOnline = markOnline(socket.userId, socket.id);
  if (becameOnline) {
    io.emit('user:online', { userId: socket.userId });
    User.findByIdAndUpdate(socket.userId, { lastSeenAt: new Date() }).catch(() => {});
    logger.debug(`🟢 user online: ${socket.userId}`);
  }

  // Client can ask who's online
  socket.on('presence:list', (ack) => {
    if (typeof ack === 'function') {
      ack({ online: Array.from(onlineUsers.keys()) });
    }
  });

  socket.on('disconnect', async () => {
    const becameOffline = markOffline(socket.userId, socket.id);
    if (becameOffline) {
      io.emit('user:offline', { userId: socket.userId });
      try {
        await User.findByIdAndUpdate(socket.userId, { lastSeenAt: new Date() });
      } catch {}
      logger.debug(`⚫ user offline: ${socket.userId}`);
    }
  });
};

module.exports.getOnlineUsers = () => Array.from(onlineUsers.keys());