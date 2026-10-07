const User = require('../models/User');

module.exports = (io, socket) => {
  io.emit('user:online', { userId: socket.userId });

  socket.on('disconnect', async () => {
    io.emit('user:offline', { userId: socket.userId });
    try { await User.findByIdAndUpdate(socket.userId, { lastSeenAt: new Date() }); } catch {}
  });
};