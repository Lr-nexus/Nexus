import client, { unwrap } from './client';

export const pollsApi = {
  create: (payload) => unwrap(client.post('/polls', payload)),
  get: (id) => unwrap(client.get(`/polls/${id}`)),
  vote: (id, optionIndexes) => unwrap(client.post(`/polls/${id}/vote`, { optionIndexes })),
  close: (id) => unwrap(client.post(`/polls/${id}/close`)),
};