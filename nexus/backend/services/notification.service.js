const Notification = require('../models/Notification');

exports.create = async ({ userId, type, title = '', body = '', fromUserId = null, targetType = '', targetId = null, data = {} }) => {
  return Notification.create({ userId, type, title, body, fromUserId, targetType, targetId, data });
};

exports.push = async (io, payload) => {
  const doc = await exports.create(payload);
  if (io && payload.userId) {
    io.to(`user:${payload.userId}`).emit('notification:new', doc);
  }
  return doc;
};