import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppLock } from '../../context/AppLockContext';
import { useAuth } from '../../context/AuthContext';

export default function LockScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { unlock, lockNow } = useAppLock();
  const [busy, setBusy] = useState(false);

  async function tryUnlock() {
    setBusy(true);
    try { await unlock(); } finally { setBusy(false); }
  }

  useEffect(() => {
    // Auto-prompt on mount
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
          <Ionicons name="finger-print" size={26} color="#fff" />
          <Text style={styles.unlockTxt}>{busy ? 'Authenticating…' : 'Unlock with biometrics'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={tryUnlock} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>
            Try again
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
  logoText: { color: '#fff', fontSize: 52, fontWeight: '900' },
  title: { fontSize: 24, fontWeight: '800', marginTop: 26 },
  sub: { marginTop: 8, textAlign: 'center' },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    height: 54,
    borderRadius: 14,
    marginTop: 40,
  },
  unlockTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});