const Poll = require('../models/Poll');
const PollVote = require('../models/PollVote');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.create = asyncHandler(async (req, res) => {
  const { question, options = [], multipleChoice = false, anonymous = false, contextType, contextId, endsAt = null } = req.body;
  if (!question || options.length < 2) throw new ApiError(400, 'Question and at least 2 options required.');
  const poll = await Poll.create({
    authorId: req.user._id, question,
    options: options.map((text) => ({ text })),
    multipleChoice, anonymous, contextType, contextId, endsAt,
  });
  created(res, { poll });
});

exports.get = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, 'Poll not found.');
  const myVote = await PollVote.findOne({ pollId: poll._id, userId: req.user._id });
  ok(res, { poll, myVote: myVote ? myVote.optionIndexes : [] });
});

exports.vote = asyncHandler(async (req, res) => {
  const { optionIndexes = [] } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, 'Poll not found.');
  if (poll.isClosed || (poll.endsAt && poll.endsAt < new Date())) throw new ApiError(400, 'Poll closed.');
  if (!poll.multipleChoice && optionIndexes.length !== 1) throw new ApiError(400, 'Single choice only.');
  if (optionIndexes.some((i) => i < 0 || i >= poll.options.length)) throw new ApiError(400, 'Invalid option.');

  const existing = await PollVote.findOne({ pollId: poll._id, userId: req.user._id });
  if (existing) throw new ApiError(400, 'Already voted.');

  await PollVote.create({ pollId: poll._id, userId: req.user._id, optionIndexes });
  for (const i of optionIndexes) poll.options[i].votes += 1;
  poll.totalVotes += 1;
  await poll.save();

  ok(res, { poll });
});

exports.close = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, 'Poll not found.');
  if (!poll.authorId.equals(req.user._id)) throw new ApiError(403, 'Only author.');
  poll.isClosed = true;
  await poll.save();
  ok(res, { poll }, 'Poll closed.');
});