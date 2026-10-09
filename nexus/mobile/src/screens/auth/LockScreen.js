import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppLock } from '../../context/AppLockContext';
import { useAuth } from '../../context/AuthContext';

export default function LockScreen() {
  const { colors, spacing } = useTheme();
  const { user, logout } = useAuth();
  const { unlock } = useAppLock();
  const [busy, setBusy] = useState(false);

  async function tryUnlock() {
    setBusy(true);
    try { await unlock(); } finally { setBusy(false); }
  }

  function confirmSwitch() {
    Alert.alert(
      'Switch account?',
      'This will sign you out of Nova on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: logout },
      ]
    );
  }

  useEffect(() => {
    const t = setTimeout(() => { tryUnlock(); }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={['rgba(37,99,235,0.35)', 'rgba(124,58,237,0.15)', 'transparent']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <View style={[styles.logo, { backgroundColor: colors.nexusBlue }]}>
          <Text style={styles.logoText}>N</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Nova is locked</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Unlock to continue'}
        </Text>

        <TouchableOpacity
          onPress={tryUnlock}
          disabled={busy}
          style={[styles.unlockBtn, { backgroundColor: colors.nexusBlue }]}
          activeOpacity={0.85}
        >
          <Ionicons name="finger-print" size={24} color="#fff" />
          <Text style={styles.unlockTxt}>{busy ? 'Authenticating…' : 'Unlock with biometrics'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={tryUnlock} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.electricBlue, fontWeight: '700', fontSize: 13 }}>
            Try again
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={{ color: colors.textDim, marginHorizontal: 12, fontSize: 11 }}>OR</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          onPress={confirmSwitch}
          style={[
            styles.switchBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          activeOpacity={0.85}
        >
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8, fontSize: 14 }}>
            Log in with another account
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: {
    width: 96, height: 96, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 52, fontWeight: '900', includeFontPadding: false },
  title: { fontSize: 24, fontWeight: '800', marginTop: 26 },
  sub: { marginTop: 8, textAlign: 'center' },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    height: 54,
    borderRadius: 14,
    marginTop: 40,
    minWidth: 260,
  },
  unlockTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 26,
  },
  line: { flex: 1, height: 1 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    minWidth: 260,
  },
});