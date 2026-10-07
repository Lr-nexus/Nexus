import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import RizzAvatar from '../../components/rizz/RizzAvatar';
import { ROUTES } from '../../constants/routes';

const ACTIONS = [
  { key: 'reply', label: 'Generate a reply', subtitle: 'What should I say back?', emoji: '💬' },
  { key: 'chat', label: 'Chat with Rizz AI', subtitle: 'Open-ended help', emoji: '🔥' },
  { key: 'rewrite', label: 'Rewrite my message', subtitle: 'Make it smoother', emoji: '✍️' },
  { key: 'compliment', label: 'Compliment someone', subtitle: 'Warm and respectful', emoji: '💝' },
  { key: 'starter', label: 'Start a conversation', subtitle: 'Break the ice', emoji: '🚀' },
  { key: 'rescue', label: 'Rescue my conversation', subtitle: 'When it gets dry', emoji: '🚑' },
];

const TOOLS = [
  { key: 'screenshot', label: 'Screenshot Analyzer', emoji: '🖼️', route: ROUTES.RIZZ_CHAT, params: { mode: 'screenshot' } },
  { key: 'history', label: 'Rizz history', emoji: '🕘', route: ROUTES.RIZZ_HISTORY },
  { key: 'saved', label: 'Saved responses', emoji: '⭐️', route: ROUTES.RIZZ_SAVED },
  { key: 'settings', label: 'Rizz settings', emoji: '⚙️', route: ROUTES.RIZZ_SETTINGS },
];

export default function RizzHomeScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        <LinearGradient
          colors={['rgba(239,68,68,0.25)', 'rgba(245,158,11,0.10)', 'transparent']}
          style={[styles.hero, { borderRadius: radius.xl, padding: spacing.lg }]}
        >
          <RizzAvatar size={64} pulsing />
          <Text style={[styles.title, { color: colors.text, marginTop: 14 }]}>Rizz AI</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
            Powered by Google Gemini · Your conversation copilot.
          </Text>
        </LinearGradient>

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.lg }]}>
          WHAT DO YOU NEED?
        </Text>

        {ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.key}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(ROUTES.RIZZ_CHAT, { mode: a.key })}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{a.label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{a.subtitle}</Text>
            </View>
            <Text style={{ color: colors.textMuted }}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.lg }]}>
          TOOLS
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {TOOLS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() =>
                t.params
                  ? navigation.navigate(t.route, t.params)
                  : navigation.navigate(t.route)
              }
              style={[
                styles.toolCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                },
              ]}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginTop: 8 }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  iconWrap: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  toolCard: { width: '48%', borderWidth: 1, minHeight: 90, justifyContent: 'center' },
});