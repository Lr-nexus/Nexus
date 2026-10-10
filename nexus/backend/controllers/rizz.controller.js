const rizz = require('../services/rizz.service');
const RizzSavedResponse = require('../models/RizzSavedResponse');
const RizzSettings = require('../models/RizzSettings');
const RizzConversation = require('../models/RizzConversation');
const RizzMessage = require('../models/RizzMessage');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/ApiResponse');

async function loadSettings(userId) {
  let s = await RizzSettings.findOne({ userId });
  if (!s) s = await RizzSettings.create({ userId });
  return s;
}

exports.reply = asyncHandler(async (req, res) => {
  const settings = await loadSettings(req.user._id);
  const responses = await rizz.generateReplies({ ...req.body, settings });
  ok(res, { responses });
});

exports.chat = asyncHandler(async (req, res) => {
  const settings = await loadSettings(req.user._id);
  const responses = await rizz.chat({ ...req.body, settings });
  ok(res, { responses });
});

exports.rewrite = asyncHandler(async (req, res) => {
  const settings = await loadSettings(req.user._id);
  const responses = await rizz.rewrite({ ...req.body, settings });
  ok(res, { responses });
});

exports.compliment = asyncHandler(async (req, res) => {
  const settings = await loadSettings(req.user._id);
  const responses = await rizz.compliment({ ...req.body, settings });
  ok(res, { responses });
});

exports.conversationStarter = asyncHandler(async (req, res) => {
  const settings = await loadSettings(req.user._id);
  const responses = await rizz.conversationStarter({ ...req.body, settings });
  ok(res, { responses });
});

exports.rescue = asyncHandler(async (req, res) => {
  const settings = await loadSettings(req.user._id);
  const responses = await rizz.rescue({ ...req.body, settings });
  ok(res, { responses });
});

exports.saved = asyncHandler(async (req, res) => {
  const list = await RizzSavedResponse.find({ userId: req.user._id }).sort({ createdAt: -1 });
  ok(res, { saved: list });
});

exports.saveResponse = asyncHandler(async (req, res) => {
  const doc = await RizzSavedResponse.create({
    userId: req.user._id,
    content: req.body.content,
    style: req.body.style || 'smooth',
  });
  created(res, { item: doc });
});

exports.deleteSaved = asyncHandler(async (req, res) => {
  await RizzSavedResponse.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  ok(res, {}, 'Deleted');
});

exports.getSettings = asyncHandler(async (req, res) => {
  const s = await loadSettings(req.user._id);
  ok(res, { settings: s });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const s = await RizzSettings.findOneAndUpdate(
    { userId: req.user._id },
    { $set: req.body },
    { new: true, upsert: true }
  );
  ok(res, { settings: s });
});

exports.history = asyncHandler(async (req, res) => {
  const convos = await RizzConversation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  ok(res, { conversations: convos });
});

exports.deleteHistory = asyncHandler(async (req, res) => {
  await RizzConversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  await RizzMessage.deleteMany({ conversationId: req.params.id });
  ok(res, {}, 'Deleted');
});