import client, { unwrap } from './client';

export const messagesApi = {
  edit: (id, content) => unwrap(client.put(`/messages/${id}`, { content })),
  remove: (id) => unwrap(client.delete(`/messages/${id}`)),
  react: (id, emoji) => unwrap(client.post(`/messages/${id}/react`, { emoji })),
  forward: (id, conversationId) => unwrap(client.post(`/messages/${id}/forward`, { conversationId })),
};