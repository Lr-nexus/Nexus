import client, { unwrap } from './client';

export const reportsApi = {
  create: (payload) => unwrap(client.post('/reports', payload)),
  mine: () => unwrap(client.get('/reports/mine')),
};