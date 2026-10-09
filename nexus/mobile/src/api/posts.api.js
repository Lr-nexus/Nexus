import client, { unwrap } from './client';

export const postsApi = {
  feed: (params) => unwrap(client.get('/posts', { params })),
  mine: (params) => unwrap(client.get('/posts/mine', { params })),
  byUser: (userId, params) => unwrap(client.get(`/posts/user/${userId}`, { params })),
  create: (payload) => unwrap(client.post('/posts', payload)),
  get: (id) => unwrap(client.get(`/posts/${id}`)),
  remove: (id) => unwrap(client.delete(`/posts/${id}`)),
  like: (id) => unwrap(client.post(`/posts/${id}/like`)),
  save: (id) => unwrap(client.post(`/posts/${id}/save`)),
  comments: (id) => unwrap(client.get(`/posts/${id}/comments`)),
  comment: (id, content) => unwrap(client.post(`/posts/${id}/comments`, { content })),
};