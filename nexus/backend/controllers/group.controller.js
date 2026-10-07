const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/ApiResponse');

exports.create = asyncHandler(async (req, res) => {
  const { name, description = '', photo = '', memberIds = [], isPrivate = false } = req.body;
  if (!name) throw new ApiError(400, 'Group name required.');

  const group = await Group.create({
    name, description, photo, ownerId: req.user._id, isPrivate,
    membersCount: 1 + memberIds.length,
  });

  const convo = await Conversation.create({
    type: 'group', participants: [req.user._id, ...memberIds],
    name, photo, admins: [req.user._id],
  });
  group.conversationId = convo._id;
  await group.save();

  await GroupMember.create({ groupId: group._id, userId: req.user._id, role: 'owner' });
  if (memberIds.length) {
    await GroupMember.insertMany(memberIds.map((uid) => ({ groupId: group._id, userId: uid })));
  }
  created(res, { group, conversation: convo });
});

exports.get = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('ownerId', 'fullName username profilePicture');
  if (!group) throw new ApiError(404, 'Group not found.');
  const members = await GroupMember.find({ groupId: group._id }).populate('userId', 'fullName username profilePicture');
  ok(res, { group, members });
});

exports.update = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new ApiError(404, 'Group not found.');
  const me = await GroupMember.findOne({ groupId: group._id, userId: req.user._id });
  if (!me || !['owner', 'admin'].includes(me.role)) throw new ApiError(403, 'Admin only.');

  const allowed = ['name', 'description', 'photo', 'isPrivate', 'settings'];
  for (const k of allowed) if (k in req.body) group[k] = req.body[k];
  await group.save();
  ok(res, { group });
});

exports.addMembers = asyncHandler(async (req, res) => {
  const { userIds = [] } = req.body;
  const group = await Group.findById(req.params.id);
  if (!group) throw new ApiError(404, 'Group not found.');
  const me = await GroupMember.findOne({ groupId: group._id, userId: req.user._id });
  if (!me || !['owner', 'admin'].includes(me.role)) throw new ApiError(403, 'Admin only.');

  const existing = await GroupMember.find({ groupId: group._id, userId: { $in: userIds } }).select('userId');
  const existingIds = new Set(existing.map((e) => e.userId.toString()));
  const toAdd = userIds.filter((id) => !existingIds.has(id));

  if (toAdd.length) {
    await GroupMember.insertMany(toAdd.map((uid) => ({ groupId: group._id, userId: uid })));
    group.membersCount += toAdd.length;
    await group.save();
    if (group.conversationId) {
      await Conversation.findByIdAndUpdate(group.conversationId, { $addToSet: { participants: { $each: toAdd } } });
    }
  }
  ok(res, { added: toAdd.length });
});

exports.removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new ApiError(404, 'Group not found.');
  const me = await GroupMember.findOne({ groupId: group._id, userId: req.user._id });
  const target = await GroupMember.findOne({ groupId: group._id, userId: req.params.userId });
  if (!target) throw new ApiError(404, 'Not a member.');

  const isSelf = req.params.userId === req.user._id.toString();
  if (!isSelf && (!me || !['owner', 'admin'].includes(me.role))) throw new ApiError(403, 'Not allowed.');
  if (target.role === 'owner') throw new ApiError(403, 'Cannot remove owner.');

  await GroupMember.deleteOne({ _id: target._id });
  group.membersCount = Math.max(0, group.membersCount - 1);
  await group.save();
  if (group.conversationId) {
    await Conversation.findByIdAndUpdate(group.conversationId, { $pull: { participants: target.userId } });
  }
  ok(res, {}, 'Removed.');
});