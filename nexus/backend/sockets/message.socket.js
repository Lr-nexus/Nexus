const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

module.exports = (io, socket) => {
  socket.on('message:send', async (payload, ack) => {
    try {
      const { conversationId, content, type = 'text', media } = payload || {};
      const convo = await Conversation.findById(conversationId);
      if (!convo || !convo.participants.some((p) => p.equals(socket.userId))) {
        return ack?.({ success: false, message: 'Not allowed.' });
      }
      const msg = await Message.create({
        conversationId, senderId: socket.userId, type, content, media,
      });
      convo.lastMessage = msg._id;
      convo.lastMessageAt = new Date();
      await convo.save();

      io.to(`conversation:${conversationId}`).emit('message:new', msg);
      ack?.({ success: true, message: msg });
    } catch (e) {
      ack?.({ success: false, message: e.message });
    }
  });

  socket.on('message:delivered', async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { $addToSet: { deliveredTo: socket.userId } });
    io.to(`user:${socket.userId}`).emit('message:delivered', { messageId });
  });

  socket.on('message:read', async ({ messageId, conversationId }) => {
    await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: socket.userId } });
    io.to(`conversation:${conversationId}`).emit('message:read', { messageId, userId: socket.userId });
  });
};