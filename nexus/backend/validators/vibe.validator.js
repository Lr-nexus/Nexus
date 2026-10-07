const { z } = require('zod');

exports.createVibeSchema = z.object({
  body: z.object({
    videoUrl: z.string().url(),
    publicId: z.string().optional().default(''),
    thumbnail: z.string().optional().default(''),
    caption: z.string().max(500).optional().default(''),
    hashtags: z.array(z.string()).optional().default([]),
    mentions: z.array(z.string()).optional().default([]),
    music: z.object({
      title: z.string().optional(),
      artist: z.string().optional(),
      url: z.string().optional(),
    }).optional(),
    durationSeconds: z.number().optional().default(0),
    visibility: z.enum(['public', 'followers', 'private']).default('public'),
  }),
});