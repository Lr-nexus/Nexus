import { io } from 'socket.io-client';
import axios from 'axios';
import { SOCKET_URL, TOKEN_KEYS, API_URL } from '../constants/config';
import { secureStorage } from '../utils/secureStorage';

let socket = null;

// Minimal atob polyfill for Hermes
if (typeof global.atob === 'undefined') {
  global.atob = (str) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/=+$/, '');
    for (let bc = 0, bs, buffer, i = 0; (buffer = str.charAt(i++)); ) {
      buffer = chars.indexOf(buffer);
      if (~buffer) {
        bs = bc % 4 ? bs * 64 + buffer : buffer;
        if (bc++ % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
      }
    }
    return output;
  };
}

async function getFreshToken() {
  let token = await secureStorage.getItem(TOKEN_KEYS.ACCESS);
  if (!token) return null;
  try {
    const payload = JSON.parse(global.atob(token.split('.')[1]));
    const secondsLeft = (payload.exp * 1000 - Date.now()) / 1000;
    if (secondsLeft < 30) {
      const refreshToken = await secureStorage.getItem(TOKEN_KEYS.REFRESH);
      if (!refreshToken) return null;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      await secureStorage.setItem(TOKEN_KEYS.ACCESS, data.accessToken);
      await secureStorage.setItem(TOKEN_KEYS.REFRESH, data.refreshToken);
      return data.accessToken;
    }
  } catch {}
  return token;
}

export async function connectSocket() {
  if (socket?.connected) return socket;

  const token = await getFreshToken();
  if (!token) return null;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    // No `transports` restriction — allows polling fallback if WS is blocked
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    timeout: 20000,
  });

  socket.on('connect_error', async (err) => {
    console.warn('[socket] connect_error:', err?.message);
    const m = String(err?.message || '').toLowerCase();
    if (m.includes('unauthorized') || m.includes('expired') || m.includes('auth')) {
      const fresh = await getFreshToken();
      if (fresh) {
        socket.auth = { token: fresh };
        socket.connect();
      }
    }
  });

  return socket;
}

export function getSocket() { return socket; }

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}