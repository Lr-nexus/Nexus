const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

let client;
function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new ApiError(500, 'Gemini is not configured.');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

exports.generate = async (prompt) => {
  try {
    const ai = getClient();
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '';
    if (!text) throw new ApiError(502, 'Empty AI response.');
    return text;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error('Gemini error:', e.message);
    throw new ApiError(502, 'Rizz AI is temporarily unavailable.');
  }
};

exports.generateJSON = async (prompt) => {
  const text = await exports.generate(prompt);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new ApiError(502, 'Invalid AI response.');
  }
};