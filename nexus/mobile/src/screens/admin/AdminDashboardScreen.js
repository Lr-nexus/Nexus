import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import { ROUTES } from '../../constants/routes';

const CARDS = [
  { key: 'users', label: 'Users', emoji: '👥', route: ROUTES.ADMIN_USERS },
  { key: 'reports', label: 'Reports', emoji: '🚩', route: ROUTES.ADMIN_REPORTS },
  { key: 'stats', label: 'Statistics', emoji: '📊', route: ROUTES.ADMIN_STATS },
];

export default function AdminDashboardScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Admin"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
          Moderation, user management and platform analytics.
        </Text>
        {CARDS.map((c) => (
          <TouchableOpacity
            key={c.key}
            onPress={() => navigation.navigate(c.route)}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginBottom: 10,
              },
            ]}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 30 }}>{c.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
                {c.label}
              </Text>
            </View>
            <Text style={{ color: colors.textMuted }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});