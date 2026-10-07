const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth routes (smoke)', () => {
  it('rejects /register with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('rejects /request-otp with empty identifier', async () => {
    const res = await request(app).post('/api/auth/request-otp').send({ identifier: '' });
    expect(res.status).toBe(400);
  });

  it('rejects /verify-otp with non-numeric otp', async () => {
    const res = await request(app).post('/api/auth/verify-otp').send({ identifier: 'a@b.com', otp: 'abc' });
    expect(res.status).toBe(400);
  });

  it('rejects /me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});