const { z } = require('zod');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[1-9]\d{6,14}$/;
const usernameRe = /^[a-z0-9_.]{3,24}$/;

exports.registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(60),
    username: z.string().regex(usernameRe, '3-24 chars, a-z 0-9 _ .'),
    email: z.string().regex(emailRe, 'Invalid email'),
    phone: z.string().regex(phoneRe, 'Invalid phone (e.g. +234...)'),
    dateOfBirth: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
    password: z.string().min(8).max(128),
  }),
});

exports.requestOtpSchema = z.object({
  body: z.object({
    identifier: z.string().min(3).max(60),
    purpose: z.enum(['REGISTRATION', 'LOGIN', 'EMAIL_VERIFICATION', 'ACCOUNT_RECOVERY']).default('LOGIN'),
  }),
});

exports.verifyOtpSchema = z.object({
  body: z.object({
    identifier: z.string().min(3).max(60),
    otp: z.string().regex(/^\d{4,8}$/),
    purpose: z.enum(['REGISTRATION', 'LOGIN', 'EMAIL_VERIFICATION', 'ACCOUNT_RECOVERY']).default('LOGIN'),
  }),
});