import client, { unwrap } from './client';

export const vibesApi = {
  feed: (params) => unwrap(client.get('/vibes', { params })),
  create: (payload) => unwrap(client.post('/vibes', payload)),
  get: (id) => unwrap(client.get(`/vibes/${id}`)),
  like: (id) => unwrap(client.post(`/vibes/${id}/like`)),
  save: (id) => unwrap(client.post(`/vibes/${id}/save`)),
  view: (id, watchSeconds = 0) => unwrap(client.post(`/vibes/${id}/view`, { watchSeconds })),
  comments: (id) => unwrap(client.get(`/vibes/${id}/comments`)),
  comment: (id, content) => unwrap(client.post(`/vibes/${id}/comments`, { content })),
};