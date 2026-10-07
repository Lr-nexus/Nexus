const request = require('supertest');
const express = require('express');
const storyRoutes = require('../routes/story.routes');

const app = express();
app.use(express.json());
app.use('/api/stories', storyRoutes);

describe('Story routes (auth guard)', () => {
  it('rejects GET / without auth', async () => {
    const res = await request(app).get('/api/stories');
    expect(res.status).toBe(401);
  });
});