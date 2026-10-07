const request = require('supertest');
const express = require('express');
const rizzRoutes = require('../routes/rizz.routes');

const app = express();
app.use(express.json());
app.use('/api/rizz', rizzRoutes);

describe('Rizz routes (auth guard)', () => {
  it('rejects POST /reply without auth', async () => {
    const res = await request(app).post('/api/rizz/reply').send({ message: 'hi', style: 'smooth' });
    expect(res.status).toBe(401);
  });

  it('rejects POST /chat without auth', async () => {
    const res = await request(app).post('/api/rizz/chat').send({ message: 'hi', style: 'smooth' });
    expect(res.status).toBe(401);
  });
});