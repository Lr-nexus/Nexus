const { z } = require('zod');

exports.sendMessageSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional().default(''),
    type: z.enum(['text', 'image', 'video', 'file', 'audio', 'location', 'contact']).default('text'),
    media: z.object({
      url: z.string().optional(),
      publicId: z.string().optional(),
      mimeType: z.string().optional(),
      size: z.number().optional(),
      name: z.string().optional(),
    }).optional(),
  }).refine((b) => b.content || b.media?.url, 'Message needs content or media.'),
});