const { z } = require('zod');

exports.createStorySchema = z.object({
  body: z.object({
    type: z.enum(['image', 'video', 'text']).default('image'),
    media: z.object({
      url: z.string().url().optional(),
      publicId: z.string().optional(),
      mimeType: z.string().optional(),
      thumbnail: z.string().optional(),
    }).optional(),
    text: z.string().max(300).optional(),
    textStyle: z.object({
      color: z.string().optional(),
      background: z.string().optional(),
    }).optional(),
    stickers: z.array(z.object({
      emoji: z.string(),
      x: z.number(),
      y: z.number(),
      scale: z.number().optional(),
    })).optional(),
    music: z.object({
      title: z.string().optional(),
      artist: z.string().optional(),
      url: z.string().optional(),
    }).optional(),
    privacy: z.enum(['everyone', 'followers', 'close', 'selected']).default('everyone'),
    allowedUsers: z.array(z.string()).optional().default([]),
    hiddenFrom: z.array(z.string()).optional().default([]),
  }),
});