const { z } = require('zod');

exports.updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(60).optional(),
    bio: z.string().max(200).optional(),
    website: z.string().url().or(z.literal('')).optional(),
    profilePicture: z.string().url().or(z.literal('')).optional(),
    isPrivate: z.boolean().optional(),
  }),
});