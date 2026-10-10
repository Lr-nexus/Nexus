import client, { unwrap } from './client';

export const usersApi = {
  me: () => unwrap(client.get('/users/me')),
  updateMe: (patch) => unwrap(client.put('/users/me', patch)),
  deleteMe: () => unwrap(client.delete('/users/me')),
  get: (id) => unwrap(client.get(`/users/${id}`)),
  search: (q) => unwrap(client.get('/users/search', { params: { q } })),

  follow: (id) => unwrap(client.post(`/users/${id}/follow`)),
  unfollow: (id) => unwrap(client.delete(`/users/${id}/follow`)),
  followStatus: (id) => unwrap(client.get(`/users/${id}/follow-status`)),
  followers: (id) => unwrap(client.get(`/users/${id}/followers`)),
  following: (id) => unwrap(client.get(`/users/${id}/following`)),
  followRequests: () => unwrap(client.get('/users/follow-requests/pending')),
  acceptFollowRequest: (id) => unwrap(client.post(`/users/follow-requests/${id}/accept`)),
  rejectFollowRequest: (id) => unwrap(client.post(`/users/follow-requests/${id}/reject`)),
  removeFollower: (userId) => unwrap(client.delete(`/users/followers/${userId}`)),
};