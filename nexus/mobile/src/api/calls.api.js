import client, { unwrap } from './client';

export const callsApi = {
  initiate: (participantIds, type = 'audio', conversationId = null) =>
    unwrap(client.post('/calls', { participantIds, type, conversationId })),
  answer: (id, accepted) => unwrap(client.post(`/calls/${id}/answer`, { accepted })),
  end: (id) => unwrap(client.post(`/calls/${id}/end`)),
  history: () => unwrap(client.get('/calls/history')),
};