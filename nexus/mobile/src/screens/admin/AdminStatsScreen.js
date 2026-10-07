import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../api/admin.api';
import Header from '../../components/common/Header';

export default function AdminStatsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([adminApi.stats(), adminApi.analytics()]);
      setStats(s);
      setAnalytics(a);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const tiles = [
    { key: 'totalUsers', label: 'Total users', emoji: '👥' },
    { key: 'activeUsers', label: 'Active users', emoji: '✅' },
    { key: 'totalPosts', label: 'Posts', emoji: '🖼️' },
    { key: 'totalVibes', label: 'Vibes', emoji: '🎬' },
    { key: 'totalMessages', label: 'Messages', emoji: '💬' },
    { key: 'totalGroups', label: 'Groups', emoji: '👨‍👩‍👧' },
    { key: 'totalCommunities', label: 'Communities', emoji: '🏛️' },
    { key: 'totalChannels', label: 'Channels', emoji: '📢' },
    { key: 'pendingReports', label: 'Pending reports', emoji: '🚩' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Statistics"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.grid}>
          {tiles.map((t) => (
            <View
              key={t.key}
              style={[
                styles.tile,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                },
              ]}
            >
              <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 8 }}>
                {stats?.[t.key] ?? 0}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>

        {analytics?.last30Days ? (
          <>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.6,
                marginTop: 20,
                marginBottom: 8,
              }}
            >
              LAST 30 DAYS
            </Text>
            <View
              style={[
                styles.tile,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  width: '100%',
                  marginBottom: 8,
                },
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 15 }}>
                New users: <Text style={{ fontWeight: '800' }}>{analytics.last30Days.newUsers}</Text>
              </Text>
              <Text style={{ color: colors.text, fontSize: 15, marginTop: 6 }}>
                AI requests: <Text style={{ fontWeight: '800' }}>{analytics.last30Days.aiRequests}</Text>
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', borderWidth: 1 },
});