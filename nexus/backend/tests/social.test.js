const request = require('supertest');
const express = require('express');
const postRoutes = require('../routes/post.routes');

const app = express();
app.use(express.json());
app.use('/api/posts', postRoutes);

describe('Post routes (auth guard)', () => {
  it('rejects GET / without auth', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(401);
  });

  it('rejects POST /:id/like without auth', async () => {
    const res = await request(app).post('/api/posts/xxx/like').send({});
    expect(res.status).toBe(401);
  });
});