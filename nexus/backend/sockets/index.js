const authSocket = require('./auth.socket');
const messageSocket = require('./message.socket');
const typingSocket = require('./typing.socket');
const presenceSocket = require('./presence.socket');
const callSocket = require('./call.socket');
const notificationSocket = require('./notification.socket');
const logger = require('../utils/logger');

module.exports = function initSockets(io) {
  io.use(authSocket);

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    socket.on('conversation:join', (id) => socket.join(`conversation:${id}`));
    socket.on('conversation:leave', (id) => socket.leave(`conversation:${id}`));

    messageSocket(io, socket);
    typingSocket(io, socket);
    presenceSocket(io, socket);
    callSocket(io, socket);
    notificationSocket(io, socket);
  });
};