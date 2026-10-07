export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || 'Nova';
export const COMPANY = process.env.EXPO_PUBLIC_COMPANY || 'Nexus';
export const TAGLINE = process.env.EXPO_PUBLIC_APP_TAGLINE || 'Connect. Chat. Share. Discover.';

export const TOKEN_KEYS = {
  ACCESS: 'nova_access_token',
  REFRESH: 'nova_refresh_token',
  THEME: 'nova_theme',
  ONBOARDED: 'nova_onboarded',
};

export const PAGINATION = { LIMIT: 20, MESSAGES_LIMIT: 50 };
export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 60;

export const MAX_UPLOAD = {
  IMAGE_MB: 10,
  VIDEO_MB: 50,
  FILE_MB: 20,
  AUDIO_MB: 10,
};