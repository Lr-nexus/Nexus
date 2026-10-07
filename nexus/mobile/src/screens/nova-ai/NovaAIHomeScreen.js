import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../constants/routes';

const CAPS = [
  { key: 'chat', label: 'Ask anything', emoji: '💬' },
  { key: 'summarize', label: 'Summarize text', emoji: '📝' },
  { key: 'captions', label: 'Write captions', emoji: '🖋️' },
  { key: 'translate', label: 'Translate', emoji: '🌐' },
  { key: 'brainstorm', label: 'Brainstorm ideas', emoji: '💡' },
  { key: 'notes', label: 'Take notes', emoji: '🗒️' },
];

export default function NovaAIHomeScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <LinearGradient
          colors={['rgba(37,99,235,0.28)', 'rgba(6,182,212,0.12)', 'transparent']}
          style={[styles.hero, { borderRadius: radius.xl, padding: spacing.lg }]}
        >
          <Text style={{ fontSize: 52 }}>✨</Text>
          <Text style={[styles.title, { color: colors.text }]}>Nova AI</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>
            Your general-purpose assistant. Powered by Gemini.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.NOVA_AI_CHAT)}
            style={[styles.cta, { backgroundColor: colors.nexusBlue, borderRadius: radius.md }]}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Start chatting</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={[styles.section, { color: colors.textMuted, marginTop: spacing.lg }]}>
          CAPABILITIES
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CAPS.map((c) => (
            <TouchableOpacity
              key={c.key}
              onPress={() => navigation.navigate(ROUTES.NOVA_AI_CHAT, { preset: c.key })}
              style={[
                styles.cap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginTop: 8 }}>
                {c.label}
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
  hero: { alignItems: 'center', paddingVertical: 34 },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 10 },
  cta: { paddingHorizontal: 26, paddingVertical: 12, marginTop: 20 },
  cap: { width: '48%', borderWidth: 1, minHeight: 90, justifyContent: 'center' },
});