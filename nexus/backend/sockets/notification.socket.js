const Notification = require('../models/Notification');

module.exports = (io, socket) => {
  socket.on('notification:read', async ({ notificationId }) => {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: socket.userId },
      { readAt: new Date() }
    );
    io.to(`user:${socket.userId}`).emit('notification:read', { notificationId });
  });
};