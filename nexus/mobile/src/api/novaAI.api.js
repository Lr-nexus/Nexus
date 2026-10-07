import client, { unwrap } from './client';

export const novaAIApi = {
  chat: (message) => unwrap(client.post('/nova-ai/chat', { message })),
  summarize: (text) => unwrap(client.post('/nova-ai/summarize', { text })),
};

// Backwards-compatible alias in case any file still imports nexusAIApi
export const nexusAIApi = novaAIApi;