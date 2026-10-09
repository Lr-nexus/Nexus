import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket.service';
import { useAuth } from './AuthContext';

const SocketCtx = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthed } = useAuth();
  const [connected, setConnected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isAuthed) {
      disconnectSocket();
      ref.current = null;
      setConnected(false);
      return;
    }

    let mounted = true;

    (async () => {
      const s = await connectSocket();
      if (!mounted || !s) return;
      ref.current = s;

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));
      s.on('connect_error', () => setConnected(false));

      if (s.connected) setConnected(true);
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthed]);

  const emit = (event, payload) => ref.current?.emit(event, payload);
  const on = (event, handler) => {
    ref.current?.on(event, handler);
    return () => ref.current?.off(event, handler);
  };

  return (
    <SocketCtx.Provider value={{ socket: ref.current, connected, emit, on }}>
      {children}
    </SocketCtx.Provider>
  );
}

export function useSocket() {
  return (
    useContext(SocketCtx) || {
      socket: getSocket(),
      connected: false,
      emit: () => {},
      on: () => () => {},
    }
  );
}

export default SocketCtx;