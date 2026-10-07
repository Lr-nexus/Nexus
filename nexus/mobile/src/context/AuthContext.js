import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { authApi } from '../api/auth.api';
import { authStorage } from '../services/authStorage.service';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await authStorage.getAccess();
        if (token) {
          const { user } = await authApi.me();
          if (!cancelled) setUser(user);
        }
      } catch (e) {
        await authStorage.clear();
        if (!cancelled) setBootError(e?.response?.data?.message || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async ({ accessToken, refreshToken, user }) => {
    await authStorage.save({ accessToken, refreshToken });
    setUser(user);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user } = await authApi.me();
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = await authStorage.getRefresh();
      if (rt) await authApi.logout(rt);
    } catch {}
    await authStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        setUser,
        loading,
        bootError,
        persistSession,
        refreshUser,
        logout,
        isAuthed: !!user,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export default AuthCtx;