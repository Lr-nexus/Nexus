import { useEffect } from 'react';
import axios from 'axios';
import { AppState } from 'react-native';
import { secureStorage } from '../utils/secureStorage';
import { API_URL, TOKEN_KEYS } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default function useTokenRefresh() {
  const { isAuthed, logout } = useAuth();

  useEffect(() => {
    if (!isAuthed) return;

    let intervalId;

    async function refresh() {
      try {
        const rt = await secureStorage.getItem(TOKEN_KEYS.REFRESH);
        if (!rt) return;
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: rt });
        await secureStorage.setItem(TOKEN_KEYS.ACCESS, data.accessToken);
        await secureStorage.setItem(TOKEN_KEYS.REFRESH, data.refreshToken);
      } catch (e) {
        // Only force logout if the refresh token is explicitly invalid
        if (e?.response?.status === 401) {
          await logout();
        }
      }
    }

    // Refresh on mount
    refresh();

    // Refresh every 10 minutes while app is foreground
    intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);

    // Also refresh when the app comes back from background
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearInterval(intervalId);
      sub.remove();
    };
  }, [isAuthed, logout]);
}