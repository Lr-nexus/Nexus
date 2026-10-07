import client, { unwrap } from './client';

export const rizzApi = {
  reply: (payload) => unwrap(client.post('/rizz/reply', payload)),
  chat: (payload) => unwrap(client.post('/rizz/chat', payload)),
  rewrite: (payload) => unwrap(client.post('/rizz/rewrite', payload)),
  compliment: (payload) => unwrap(client.post('/rizz/compliment', payload)),
  starter: (payload) => unwrap(client.post('/rizz/conversation-starter', payload)),
  rescue: (payload) => unwrap(client.post('/rizz/rescue', payload)),
  saved: () => unwrap(client.get('/rizz/saved')),
  save: (payload) => unwrap(client.post('/rizz/saved', payload)),
  deleteSaved: (id) => unwrap(client.delete(`/rizz/saved/${id}`)),
  settings: () => unwrap(client.get('/rizz/settings')),
  updateSettings: (patch) => unwrap(client.put('/rizz/settings', patch)),
  history: () => unwrap(client.get('/rizz/history')),
  deleteHistory: (id) => unwrap(client.delete(`/rizz/history/${id}`)),
};