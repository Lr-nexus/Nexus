const novaAI = require('../services/novaAI.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/ApiResponse');

exports.chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const reply = await novaAI.chat({ message });
  ok(res, { reply });
});

exports.summarize = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const summary = await novaAI.summarize(text);
  ok(res, { summary });
});