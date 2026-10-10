const gemini = require('./gemini.service');

const STYLES = {
  chill: 'relaxed, low-key, casual',
  cute: 'sweet, warm, wholesome',
  smooth: 'confident, charming, effortlessly cool',
  funny: 'playful, witty, light-hearted',
  romantic: 'warm, sincere, affectionate',
  flirty: 'playful, teasing, subtly suggestive (tasteful)',
  clever: 'smart, sharp, quick-witted',
  savage: 'bold, cheeky but never cruel',
  sweet: 'kind, warm, thoughtful',
  friendly: 'casual, approachable, kind',
};

function systemPrompt({ style, personality, context, task }) {
  return `You are Rizz AI inside the Nova app (a product by Nexus).
You help users craft natural, respectful social replies.

Rules:
- Never be manipulative, coercive, threatening or sexual.
- Keep the tone human, not corporate.
- Respect consent and boundaries.

Style: ${style || 'smooth'}
Personality: ${personality || 'confident'}
Context: ${context || '(none)'}

Task: ${task}

Return ONLY valid JSON in this exact shape:
{ "responses": ["...", "...", "..."] }`;
}

function pickStyle(reqStyle, defaultStyle) {
  const chosen = reqStyle || defaultStyle || 'smooth';
  return STYLES[chosen] || chosen;
}

function pickPersonality(reqPersonality, defaultPersonality) {
  return reqPersonality || defaultPersonality || 'confident';
}

exports.generateReplies = async ({ message, style, personality, context, settings }) => {
  const task = `Generate 3 distinct reply options to this incoming message: "${message}". Vary angle and tone slightly between options.`;
  const prompt = systemPrompt({
    style: pickStyle(style, settings?.defaultStyle),
    personality: pickPersonality(personality, settings?.personality),
    context,
    task,
  });
  const data = await gemini.generateJSON(prompt);
  return Array.isArray(data.responses) ? data.responses.slice(0, 5) : [];
};

exports.rewrite = async ({ message, tone, style, settings }) => {
  const task = `Rewrite the user's message to be ${tone}. Original: "${message}".`;
  const prompt = systemPrompt({
    style: pickStyle(style, settings?.defaultStyle),
    personality: pickPersonality(null, settings?.personality),
    context: '',
    task,
  });
  const data = await gemini.generateJSON(prompt);
  return Array.isArray(data.responses) ? data.responses.slice(0, 3) : [];
};

exports.compliment = async ({ vibe, situation, relationship, style, settings }) => {
  const task = `Generate 3 respectful compliments. Vibe: ${vibe || 'n/a'}. Situation: ${situation || 'n/a'}. Relationship: ${relationship || 'n/a'}.`;
  const prompt = systemPrompt({
    style: pickStyle(style, settings?.defaultStyle),
    personality: pickPersonality(null, settings?.personality),
    context: '',
    task,
  });
  const data = await gemini.generateJSON(prompt);
  return Array.isArray(data.responses) ? data.responses.slice(0, 3) : [];
};

exports.conversationStarter = async ({ category, style, settings }) => {
  const task = `Generate 5 natural conversation starters for the "${category}" category.`;
  const prompt = systemPrompt({
    style: pickStyle(style, settings?.defaultStyle),
    personality: pickPersonality(null, settings?.personality),
    context: '',
    task,
  });
  const data = await gemini.generateJSON(prompt);
  return Array.isArray(data.responses) ? data.responses.slice(0, 5) : [];
};

exports.rescue = async ({ lastMessage, style, settings }) => {
  const task = `The conversation is drying up. Last message: "${lastMessage}". Give 3 ways to revive it naturally.`;
  const prompt = systemPrompt({
    style: pickStyle(style, settings?.defaultStyle),
    personality: pickPersonality(null, settings?.personality),
    context: '',
    task,
  });
  const data = await gemini.generateJSON(prompt);
  return Array.isArray(data.responses) ? data.responses.slice(0, 3) : [];
};

exports.chat = async ({ message, style, personality, context, settings }) => {
  const task = `Reply to the user's request: "${message}". Give 3 options.`;
  const prompt = systemPrompt({
    style: pickStyle(style, settings?.defaultStyle),
    personality: pickPersonality(personality, settings?.personality),
    context,
    task,
  });
  const data = await gemini.generateJSON(prompt);
  return Array.isArray(data.responses) ? data.responses.slice(0, 5) : [];
};