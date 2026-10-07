import client, { unwrap } from './client';

export const usersApi = {
  me: () => unwrap(client.get('/users/me')),
  updateMe: (patch) => unwrap(client.put('/users/me', patch)),
  deleteMe: () => unwrap(client.delete('/users/me')),
  get: (id) => unwrap(client.get(`/users/${id}`)),
  search: (q) => unwrap(client.get('/users/search', { params: { q } })),
};