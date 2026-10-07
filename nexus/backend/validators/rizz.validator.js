const { z } = require('zod');

const styleEnum = z.enum(['chill','cute','smooth','funny','romantic','flirty','clever','savage','sweet','friendly']).default('smooth');

exports.replySchema = z.object({ body: z.object({
  message: z.string().min(1).max(2000),
  style: styleEnum,
  personality: z.string().max(40).optional(),
  context: z.string().max(4000).optional(),
})});

exports.chatSchema = z.object({ body: z.object({
  message: z.string().min(1).max(2000),
  style: styleEnum,
  personality: z.string().max(40).optional(),
  context: z.string().max(4000).optional(),
})});

exports.rewriteSchema = z.object({ body: z.object({
  message: z.string().min(1).max(2000),
  tone: z.string().min(2).max(40).default('more confident'),
  style: styleEnum,
})});

exports.complimentSchema = z.object({ body: z.object({
  vibe: z.string().max(80).optional(),
  situation: z.string().max(200).optional(),
  relationship: z.string().max(80).optional(),
  style: styleEnum,
})});

exports.starterSchema = z.object({ body: z.object({
  category: z.string().min(2).max(40),
  style: styleEnum,
})});

exports.rescueSchema = z.object({ body: z.object({
  lastMessage: z.string().min(1).max(500),
  style: styleEnum,
})});