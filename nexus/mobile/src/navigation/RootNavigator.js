import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { Screens } from './screens';
import { stackScreenOptions, modalScreenOptions } from './stackOptions';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { secureStorage } from '../utils/secureStorage';
import { TOKEN_KEYS } from '../constants/config';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthed, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const seen = await secureStorage.getItem(TOKEN_KEYS.ONBOARDED);
        if (!seen) await secureStorage.setItem(TOKEN_KEYS.ONBOARDED, '1');
      } catch {}
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} size="large" />
        <Text style={[styles.brand, { color: colors.text }]}>NOVA</Text>
        <Text style={[styles.company, { color: colors.textDim }]}>by Nexus</Text>
        <Text style={[styles.tag, { color: colors.textMuted }]}>
          Connect. Chat. Share. Discover.
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      {isAuthed ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name={ROUTES.CHAT} component={Screens.Chat} options={modalScreenOptions} />
          <Stack.Screen name={ROUTES.CALL} component={Screens.Call} options={modalScreenOptions} />
          <Stack.Screen
            name={ROUTES.INCOMING_CALL}
            component={Screens.IncomingCall}
            options={{ ...modalScreenOptions, animation: 'fade' }}
          />
          <Stack.Screen name={ROUTES.NOVA_AI_CHAT} component={Screens.NovaAIChat} />
          <Stack.Screen name={ROUTES.ADMIN_DASHBOARD} component={Screens.AdminDashboard} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    marginTop: 24,
    includeFontPadding: false,
  },
  company: {
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  tag: { marginTop: 10, fontSize: 13, includeFontPadding: false },
});