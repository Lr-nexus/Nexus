module.exports = (io, socket) => {
  socket.on('call:join', ({ callId }) => socket.join(`call:${callId}`));
  socket.on('call:leave', ({ callId }) => socket.leave(`call:${callId}`));

  socket.on('call:signal', ({ callId, targetUserId, signal }) => {
    io.to(`user:${targetUserId}`).emit('call:signal', {
      fromUserId: socket.userId, callId, signal,
    });
  });
};