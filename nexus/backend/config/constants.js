module.exports = {
  ROLES: { USER: 'user', ADMIN: 'admin' },
  USER_STATUS: { ACTIVE: 'active', SUSPENDED: 'suspended', BANNED: 'banned' },
  OTP_PURPOSE: {
    REGISTRATION: 'REGISTRATION',
    LOGIN: 'LOGIN',
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    ACCOUNT_RECOVERY: 'ACCOUNT_RECOVERY',
  },
  MESSAGE_TYPES: ['text', 'image', 'video', 'file', 'audio', 'location', 'contact'],
  REPORT_STATUS: ['pending', 'under_review', 'resolved', 'rejected'],
  RIZZ_STYLES: ['chill','cute','smooth','funny','romantic','flirty','clever','savage','sweet','friendly'],
  UPLOAD_LIMITS: {
    IMAGE: 10 * 1024 * 1024,
    VIDEO: 50 * 1024 * 1024,
    FILE: 20 * 1024 * 1024,
    AUDIO: 10 * 1024 * 1024,
  },
};