import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';
import Header from '../../components/common/Header';
import ToggleRow from './_ToggleRow';
import { RIZZ_STYLES, RIZZ_PERSONALITIES } from '../../constants/rizzStyles';

export default function AISettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await rizzApi.settings();
        setSettings(res.settings || { personality: 'confident', defaultStyle: 'smooth', historyEnabled: true });
      } catch {
        setSettings({ personality: 'confident', defaultStyle: 'smooth', historyEnabled: true });
      } finally { setLoading(false); }
    })();
  }, []);

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
        title="AI settings"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={sectionTitle(colors)}>DEFAULT STYLE</Text>
        <View style={styles.chipRow}>
          {RIZZ_STYLES.map((s) => (
            <Chip
              key={s.key}
              active={settings.defaultStyle === s.key}
              onPress={() => patch({ defaultStyle: s.key })}
              label={`${s.emoji} ${s.label}`}
            />
          ))}
        </View>

        <Text style={sectionTitle(colors)}>PERSONALITY</Text>
        <View style={styles.chipRow}>
          {RIZZ_PERSONALITIES.map((p) => (
            <Chip
              key={p.key}
              active={settings.personality === p.key}
              onPress={() => patch({ personality: p.key })}
              label={p.label}
            />
          ))}
        </View>

        <Text style={sectionTitle(colors)}>HISTORY</Text>
        <ToggleRow
          label="Save Rizz history"
          value={settings.historyEnabled}
          onChange={(v) => patch({ historyEnabled: v })}
          subtitle="Keep past AI conversations for later."
        />

        <Text style={sectionTitle(colors)}>SHORTCUTS</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RizzHistory')}
          style={cardStyle(colors, radius, spacing)}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Open Rizz history</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('RizzSaved')}
          style={cardStyle(colors, radius, spacing)}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Open saved responses</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }) {
  const { colors, radius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.nexusBlue : colors.card,
          borderColor: colors.border,
          borderRadius: radius.pill,
        },
      ]}
    >
      <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700', fontSize: 12 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const sectionTitle = (colors) => ({
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: '800',
  letterSpacing: 0.6,
  marginTop: 16,
  marginBottom: 8,
});

const cardStyle = (colors, radius, spacing) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radius.md,
  paddingHorizontal: spacing.md,
  paddingVertical: 14,
  marginBottom: 8,
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
});