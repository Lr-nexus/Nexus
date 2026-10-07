import client, { unwrap } from './client';

export const communitiesApi = {
  list: () => unwrap(client.get('/communities')),
  create: (payload) => unwrap(client.post('/communities', payload)),
  get: (id) => unwrap(client.get(`/communities/${id}`)),
  join: (id) => unwrap(client.post(`/communities/${id}/join`)),
  leave: (id) => unwrap(client.post(`/communities/${id}/leave`)),
};