module.exports = (io, socket) => {
  socket.on('message:typing', ({ conversationId, isTyping = true }) => {
    socket.to(`conversation:${conversationId}`).emit('message:typing', {
      conversationId, userId: socket.userId, isTyping,
    });
  });
};