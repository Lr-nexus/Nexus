const request = require('supertest');
const express = require('express');
const conversationRoutes = require('../routes/conversation.routes');

const app = express();
app.use(express.json());
app.use('/api/conversations', conversationRoutes);

describe('Conversation routes (auth guard)', () => {
  it('rejects GET / without auth', async () => {
    const res = await request(app).get('/api/conversations');
    expect(res.status).toBe(401);
  });

  it('rejects POST / without auth', async () => {
    const res = await request(app).post('/api/conversations').send({});
    expect(res.status).toBe(401);
  });
});