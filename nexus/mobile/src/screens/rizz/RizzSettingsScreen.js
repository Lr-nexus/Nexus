import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';
import Header from '../../components/common/Header';
import { RIZZ_STYLES, RIZZ_PERSONALITIES } from '../../constants/rizzStyles';

export default function RizzSettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await rizzApi.settings();
      setSettings(res.settings || { personality: 'confident', defaultStyle: 'smooth', historyEnabled: true });
    } catch {
      setSettings({ personality: 'confident', defaultStyle: 'smooth', historyEnabled: true });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(update) {
    const next = { ...settings, ...update };
    setSettings(next);
    try { await rizzApi.updateSettings(update); } catch {}
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Rizz settings"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[styles.section, { color: colors.textMuted }]}>DEFAULT STYLE</Text>
        <View style={styles.rowWrap}>
          {RIZZ_STYLES.map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => patch({ defaultStyle: s.key })}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.defaultStyle === s.key ? colors.nexusBlue : colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                style={{
                  color: settings.defaultStyle === s.key ? '#fff' : colors.text,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {s.emoji} {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.textMuted, marginTop: 20 }]}>PERSONALITY</Text>
        <View style={styles.rowWrap}>
          {RIZZ_PERSONALITIES.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => patch({ personality: p.key })}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.personality === p.key ? colors.nexusBlue : colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                style={{
                  color: settings.personality === p.key ? '#fff' : colors.text,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.textMuted, marginTop: 20 }]}>HISTORY</Text>
        <TouchableOpacity
          onPress={() => patch({ historyEnabled: !settings.historyEnabled })}
          style={[
            styles.toggle,
            { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Save Rizz history</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              Keep past AI chats for later.
            </Text>
          </View>
          <Text style={{ fontSize: 20 }}>{settings.historyEnabled ? '✅' : '⬜️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('RizzHistory')}
          style={[
            styles.link,
            { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
          ]}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Open history</Text>
          <Text style={{ color: colors.textMuted }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('RizzSaved')}
          style={[
            styles.link,
            { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
          ]}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Open saved responses</Text>
          <Text style={{ color: colors.textMuted }}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 8,
  },
});