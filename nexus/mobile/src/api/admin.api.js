import client, { unwrap } from './client';

export const adminApi = {
  users: (params) => unwrap(client.get('/admin/users', { params })),
  suspendUser: (id) => unwrap(client.post(`/admin/users/${id}/suspend`)),
  banUser: (id) => unwrap(client.post(`/admin/users/${id}/ban`)),
  activateUser: (id) => unwrap(client.post(`/admin/users/${id}/activate`)),
  deleteUser: (id) => unwrap(client.delete(`/admin/users/${id}`)),
  reports: (params) => unwrap(client.get('/admin/reports', { params })),
  updateReport: (id, patch) => unwrap(client.put(`/admin/reports/${id}`, patch)),
  stats: () => unwrap(client.get('/admin/stats')),
  analytics: () => unwrap(client.get('/admin/analytics')),
  auditLogs: (params) => unwrap(client.get('/admin/audit-logs', { params })),
};