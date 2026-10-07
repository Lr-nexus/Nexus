const { z } = require('zod');

exports.createPostSchema = z.object({
  body: z.object({
    type: z.enum(['text', 'image', 'video', 'carousel']).default('text'),
    caption: z.string().max(2200).optional().default(''),
    media: z.array(z.object({
      url: z.string().url(),
      publicId: z.string().optional(),
      mimeType: z.string().optional(),
    })).optional().default([]),
    hashtags: z.array(z.string()).optional().default([]),
    location: z.string().max(120).optional().default(''),
    visibility: z.enum(['public', 'followers', 'close', 'private']).default('public'),
  }),
});