import { io } from 'socket.io-client';
import axios from 'axios';
import { SOCKET_URL, TOKEN_KEYS, API_URL } from '../constants/config';
import { secureStorage } from '../utils/secureStorage';

let socket = null;

async function getFreshToken() {
  let token = await secureStorage.getItem(TOKEN_KEYS.ACCESS);
  if (!token) return null;

  // Check if token is expired or about to expire in the next 30 seconds
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const secondsUntilExpiry = (expiresAt - Date.now()) / 1000;

    if (secondsUntilExpiry < 30) {
      // Refresh proactively
      const refreshToken = await secureStorage.getItem(TOKEN_KEYS.REFRESH);
      if (!refreshToken) return null;

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      await secureStorage.setItem(TOKEN_KEYS.ACCESS, data.accessToken);
      await secureStorage.setItem(TOKEN_KEYS.REFRESH, data.refreshToken);
      return data.accessToken;
    }
  } catch (e) {
    console.warn('[socket] token parse/refresh failed:', e?.message);
  }

  return token;
}

export async function connectSocket() {
  if (socket?.connected) return socket;

  const token = await getFreshToken();
  if (!token) return null;

  // Tear down old socket if present
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    // Refresh the token on every reconnect attempt
    authCallback: async (cb) => {
      const fresh = await getFreshToken();
      cb({ token: fresh });
    },
  });

  socket.on('connect_error', async (err) => {
    console.warn('[socket] connect_error:', err?.message);
    // If auth failed, refresh and retry once
    if (String(err?.message || '').toLowerCase().includes('unauthorized') ||
        String(err?.message || '').toLowerCase().includes('expired') ||
        String(err?.message || '').toLowerCase().includes('no auth token')) {
      const fresh = await getFreshToken();
      if (fresh) {
        socket.auth = { token: fresh };
        socket.connect();
      }
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}