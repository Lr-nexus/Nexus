const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin.routes');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin routes (auth + role guard)', () => {
  it('rejects GET /stats without auth', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('rejects GET /users without auth', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});