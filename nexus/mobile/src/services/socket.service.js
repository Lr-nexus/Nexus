import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL, TOKEN_KEYS } from '../constants/config';

let socket = null;

export async function connectSocket() {
  if (socket?.connected) return socket;
  const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
  if (!token) return null;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}