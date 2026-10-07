const { z } = require('zod');

exports.createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(80),
    description: z.string().max(500).optional().default(''),
    photo: z.string().url().or(z.literal('')).optional().default(''),
    memberIds: z.array(z.string()).optional().default([]),
    isPrivate: z.boolean().optional().default(false),
  }),
});

exports.addMembersSchema = z.object({
  body: z.object({ userIds: z.array(z.string()).min(1) }),
});