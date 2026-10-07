const { z } = require('zod');

exports.updateReportSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'under_review', 'resolved', 'rejected']),
    action: z.enum(['none', 'content_removed', 'user_warned', 'user_suspended', 'user_banned']).default('none'),
    notes: z.string().max(1000).optional().default(''),
  }),
});