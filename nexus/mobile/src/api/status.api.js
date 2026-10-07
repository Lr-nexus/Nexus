import client, { unwrap } from './client';

export const statusApi = {
  feed: () => unwrap(client.get('/statuses')),
  create: (payload) => unwrap(client.post('/statuses', payload)),
  remove: (id) => unwrap(client.delete(`/statuses/${id}`)),
  view: (id) => unwrap(client.post(`/statuses/${id}/view`)),
};