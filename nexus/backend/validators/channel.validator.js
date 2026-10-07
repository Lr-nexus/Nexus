const { z } = require('zod');

exports.createChannelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(80),
    description: z.string().max(500).optional().default(''),
    photo: z.string().url().or(z.literal('')).optional().default(''),
    isPrivate: z.boolean().optional().default(false),
    communityId: z.string().nullable().optional().default(null),
  }),
});