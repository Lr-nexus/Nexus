const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

let client;
function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new ApiError(500, 'Gemini is not configured.');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err) {
  const msg = String(err?.message || '');
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('overloaded') ||
    msg.includes('high demand')
  );
}

async function callModel(model, prompt) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  const text =
    response?.text ||
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    '';
  if (!text) throw new Error('Empty AI response');
  return text;
}

exports.generate = async (prompt) => {
  const primary = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const fallback = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';

  const models = [primary, fallback];
  const attemptsPerModel = 3;
  let lastError = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= attemptsPerModel; attempt++) {
      try {
        console.log(`🤖 Gemini: ${model} (attempt ${attempt}/${attemptsPerModel})`);
        return await callModel(model, prompt);
      } catch (e) {
        lastError = e;
        if (!isRetryable(e)) {
          console.error(`💥 Gemini ${model} fatal:`, e.message);
          if (e instanceof ApiError) throw e;
          throw new ApiError(502, 'Rizz AI is temporarily unavailable.');
        }
        console.warn(`⚠️ Gemini ${model} attempt ${attempt} failed: ${e.message.slice(0, 120)}`);
        if (attempt < attemptsPerModel) {
          await wait(500 * Math.pow(3, attempt - 1));
        }
      }
    }
    console.warn(`⚠️ Falling back from ${model} to next model…`);
  }

  console.error('💥 Gemini: all attempts and fallbacks failed:', lastError?.message);
  throw new ApiError(502, 'Rizz AI is temporarily unavailable. Try again in a moment.');
};

exports.generateJSON = async (prompt) => {
  const text = await exports.generate(prompt);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new ApiError(502, 'Invalid AI response.');
  }
};