import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SocketProvider } from './src/context/SocketContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AppLockProvider, useAppLock } from './src/context/AppLockContext';
import RootNavigator from './src/navigation/RootNavigator';
import OfflineBanner from './src/components/common/OfflineBanner';
import LockScreen from './src/screens/auth/LockScreen';
import useTokenRefresh from './src/hooks/useTokenRefresh';

function ThemedNavigation() {
  const { colors, effective } = useTheme();
  const { ready, locked } = useAppLock();

  useTokenRefresh();

  const base = effective === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.nexusBlue,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.electricBlue,
    },
  };

  if (!ready) return null;
  if (locked) return <LockScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <OfflineBanner />
      <RootNavigator />
      <StatusBar style={effective === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppLockProvider>
              <SocketProvider>
                <NotificationProvider>
                  <ThemedNavigation />
                </NotificationProvider>
              </SocketProvider>
            </AppLockProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}