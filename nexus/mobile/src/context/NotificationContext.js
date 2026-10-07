import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../api/notifications.api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationCtx = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthed } = useAuth();
  const { on } = useSocket();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!isAuthed) return;
    try {
      const { notifications } = await notificationsApi.list();
      setItems(notifications || []);
      const { count } = await notificationsApi.unreadCount();
      setUnread(count || 0);
    } catch {}
  }, [isAuthed]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const off = on('notification:new', (n) => {
      setItems((prev) => [n, ...prev]);
      setUnread((u) => u + 1);
    });
    return off;
  }, [on]);

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    setItems((prev) => prev.map((x) => (x._id === id ? { ...x, readAt: new Date() } : x)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setItems((prev) => prev.map((x) => ({ ...x, readAt: new Date() })));
    setUnread(0);
  };

  return (
    <NotificationCtx.Provider value={{ items, unread, load, markRead, markAllRead }}>
      {children}
    </NotificationCtx.Provider>
  );
}

export function useNotifications() {
  return (
    useContext(NotificationCtx) || {
      items: [],
      unread: 0,
      load: async () => {},
      markRead: async () => {},
      markAllRead: async () => {},
    }
  );
}

export default NotificationCtx;