import client, { unwrap } from './client';

export const searchApi = {
  search: (q) => unwrap(client.get('/search', { params: { q } })),
  trending: () => unwrap(client.get('/search/trending')),
  hashtag: (tag) => unwrap(client.get(`/hashtags/${tag}`)),
};