import client, { unwrap } from './client';

export const channelsApi = {
  list: () => unwrap(client.get('/channels')),
  create: (payload) => unwrap(client.post('/channels', payload)),
  get: (id) => unwrap(client.get(`/channels/${id}`)),
  follow: (id) => unwrap(client.post(`/channels/${id}/follow`)),
  unfollow: (id) => unwrap(client.post(`/channels/${id}/unfollow`)),
};