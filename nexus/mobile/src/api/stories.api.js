import client, { unwrap } from './client';

export const storiesApi = {
  feed: () => unwrap(client.get('/stories')),
  create: (payload) => unwrap(client.post('/stories', payload)),
  remove: (id) => unwrap(client.delete(`/stories/${id}`)),
  view: (id) => unwrap(client.post(`/stories/${id}/view`)),
  react: (id, emoji) => unwrap(client.post(`/stories/${id}/react`, { emoji })),
};