import client, { unwrap } from './client';

export const authApi = {
  register: (payload) => unwrap(client.post('/auth/register', payload)),
  login: (identifier, password) =>
    unwrap(client.post('/auth/login', { identifier, password })),
  requestOtp: (identifier, purpose = 'LOGIN') =>
    unwrap(client.post('/auth/request-otp', { identifier, purpose })),
  verifyOtp: (identifier, otp, purpose = 'LOGIN') =>
    unwrap(client.post('/auth/verify-otp', { identifier, otp, purpose })),
  resendOtp: (identifier, purpose = 'LOGIN') =>
    unwrap(client.post('/auth/resend-otp', { identifier, purpose })),
  resetPassword: (resetToken, newPassword) =>
    unwrap(client.post('/auth/reset-password', { resetToken, newPassword })),
  me: () => unwrap(client.get('/auth/me')),
  logout: (refreshToken) => unwrap(client.post('/auth/logout', { refreshToken })),
  logoutAll: () => unwrap(client.post('/auth/logout-all')),
  sessions: () => unwrap(client.get('/auth/sessions')),
  revokeSession: (id) => unwrap(client.delete(`/auth/sessions/${id}`)),
};