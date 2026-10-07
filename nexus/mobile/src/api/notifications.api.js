import client, { unwrap } from './client';

export const notificationsApi = {
  list: () => unwrap(client.get('/notifications')),
  unreadCount: () => unwrap(client.get('/notifications/unread-count')),
  markRead: (id) => unwrap(client.put(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(client.put('/notifications/read-all')),
};