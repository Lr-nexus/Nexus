const { z } = require('zod');

exports.createCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(80),
    description: z.string().max(1000).optional().default(''),
    photo: z.string().url().or(z.literal('')).optional().default(''),
    cover: z.string().url().or(z.literal('')).optional().default(''),
    isPrivate: z.boolean().optional().default(false),
  }),
});