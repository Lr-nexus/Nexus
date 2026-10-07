const gemini = require('./gemini.service');

exports.chat = async ({ message }) => {
  const prompt = `You are Nova AI, a general-purpose assistant inside the Nova app (a product by Nexus).
Be helpful, concise, and clear. Answer directly.
User: ${message}`;
  return gemini.generate(prompt);
};

exports.summarize = async (text) => {
  const prompt = `Summarize the following text in 3-5 bullet points:\n\n${text}`;
  return gemini.generate(prompt);
};