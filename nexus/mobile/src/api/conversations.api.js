import client, { unwrap } from './client';

export const conversationsApi = {
  list: () => unwrap(client.get('/conversations')),
  create: (participantId) => unwrap(client.post('/conversations', { participantId })),
  messages: (id, params) => unwrap(client.get(`/conversations/${id}/messages`, { params })),
  send: (id, payload) => unwrap(client.post(`/conversations/${id}/messages`, payload)),
};