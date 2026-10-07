import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { themes, typography, spacing, radius, shadow } from '../theme';
import { TOKEN_KEYS } from '../constants/config';

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setMode] = useState('system');

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(TOKEN_KEYS.THEME);
      if (stored) setMode(stored);
    })();
  }, []);

  const effective = mode === 'system' ? system || 'dark' : mode;
  const colors = themes[effective] || themes.dark;

  const value = useMemo(
    () => ({
      mode,
      effective,
      colors,
      typography,
      spacing,
      radius,
      shadow,
      setMode: async (m) => {
        setMode(m);
        await SecureStore.setItemAsync(TOKEN_KEYS.THEME, m);
      },
    }),
    [mode, effective, colors]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}

export default ThemeCtx;