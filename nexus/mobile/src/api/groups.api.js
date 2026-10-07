import client, { unwrap } from './client';

export const groupsApi = {
  create: (payload) => unwrap(client.post('/groups', payload)),
  get: (id) => unwrap(client.get(`/groups/${id}`)),
  update: (id, patch) => unwrap(client.put(`/groups/${id}`, patch)),
  addMembers: (id, userIds) => unwrap(client.post(`/groups/${id}/members`, { userIds })),
  removeMember: (id, userId) => unwrap(client.delete(`/groups/${id}/members/${userId}`)),
};