import React, { useEffect, useState } from 'react';
import {
  View, Text, Switch, StyleSheet, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAppLock } from '../../context/AppLockContext';
import Header from '../../components/common/Header';

export default function AppLockScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const {
    enabled, biometricEnabled, enableLock, disableLock, supportsBiometric, lockNow,
  } = useAppLock();
  const [hasBiometric, setHasBiometric] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => setHasBiometric(await supportsBiometric()))();
  }, [supportsBiometric]);

  async function toggle(value) {
    setBusy(true);
    try {
      if (value) await enableLock(true);
      else await disableLock();
    } catch (e) {
      Alert.alert('Could not update', e.message);
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="App Lock"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.lg }}>
        <View
          style={[
            styles.row,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.card }]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.electricBlue} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
              Require unlock
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {hasBiometric
                ? 'Use Face ID / fingerprint to open Nova'
                : 'No biometric hardware found on this device'}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggle}
            disabled={!hasBiometric || busy}
            trackColor={{ true: colors.nexusBlue, false: colors.border }}
            thumbColor="#fff"
          />
        </View>

        {enabled ? (
          <TouchableOpacity
            onPress={() => lockNow()}
            style={[
              styles.btn,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, marginTop: 14 },
            ]}
          >
            <Ionicons name="lock-closed" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: '700', marginLeft: 8 }}>
              Lock now
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 20, lineHeight: 18 }}>
          Nova locks itself automatically when you leave the app for more than a minute.
          You'll need biometrics to open it again.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, height: 48 },
});