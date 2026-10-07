const { GoogleGenerativeAI } = require('@google/generative-ai');
const ApiError = require('../utils/ApiError');

let client, model;
function getModel() {
  if (!process.env.GEMINI_API_KEY) throw new ApiError(500, 'Gemini is not configured.');
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  if (!model) model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });
  return model;
}

exports.generate = async (prompt, { json = false } = {}) => {
  try {
    const m = getModel();
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: json ? { responseMimeType: 'application/json' } : undefined,
    });
    const text = result.response.text();
    if (!text) throw new ApiError(502, 'Empty AI response.');
    return text;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error('Gemini error:', e.message);
    throw new ApiError(502, 'Rizz AI is temporarily unavailable.');
  }
};

exports.generateJSON = async (prompt) => {
  const text = await exports.generate(prompt, { json: true });
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new ApiError(502, 'Invalid AI response.');
  }
};