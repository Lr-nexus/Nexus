import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';

const MODES = [
  { key: 'system', label: 'System', emoji: '🌗' },
  { key: 'light', label: 'Light', emoji: '☀️' },
  { key: 'dark', label: 'Dark', emoji: '🌙' },
];

export default function AppearanceSettingsScreen() {
  const { colors, spacing, radius, mode, setMode } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Appearance"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 8 }}>
          THEME
        </Text>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => setMode(m.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: 16,
              backgroundColor: colors.surface,
              borderColor: mode === m.key ? colors.electricBlue : colors.border,
              borderWidth: 1,
              borderRadius: radius.md,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 12 }}>{m.emoji}</Text>
            <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{m.label}</Text>
            {mode === m.key ? (
              <Text style={{ color: colors.electricBlue, fontWeight: '800' }}>✓</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });