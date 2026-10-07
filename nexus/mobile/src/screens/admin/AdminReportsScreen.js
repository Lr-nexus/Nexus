import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../api/admin.api';
import Header from '../../components/common/Header';
import BottomSheet from '../../components/common/BottomSheet';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

const STATUSES = ['all', 'pending', 'under_review', 'resolved', 'rejected'];

export default function AdminReportsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [filter, setFilter] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.reports({ status: filter === 'all' ? undefined : filter, limit: 50 });
      setReports(res.reports || []);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function update(status, action) {
    if (!target) return;
    try {
      await adminApi.updateReport(target._id, { status, action, notes: '' });
      setTarget(null);
      load();
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || 'Try again.');
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Reports"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={[styles.filters, { padding: spacing.md }]}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilter(s)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === s ? colors.nexusBlue : colors.card,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={{
                color: filter === s ? '#fff' : colors.text,
                fontWeight: '700',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {s.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setTarget(item)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: 8,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>
                  {item.targetType} · {item.reason}
                </Text>
                <Text
                  style={{
                    color: item.status === 'pending' ? colors.warning : colors.textMuted,
                    fontSize: 11,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
              {item.description ? (
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 6 }}>
                {formatDate(item.createdAt)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState emoji="✅" title="No reports here" compact />}
        />
      )}

      <BottomSheet
        visible={!!target}
        onClose={() => setTarget(null)}
        title="Resolve report"
        items={[
          { label: 'Dismiss (rejected)', onPress: () => update('rejected', 'none') },
          { label: 'Mark under review', onPress: () => update('under_review', 'none') },
          { label: 'Resolve — content removed', onPress: () => update('resolved', 'content_removed') },
          { label: 'Resolve — warn user', onPress: () => update('resolved', 'user_warned') },
          { label: 'Resolve — suspend user', destructive: true, onPress: () => update('resolved', 'user_suspended') },
          { label: 'Resolve — ban user', destructive: true, onPress: () => update('resolved', 'user_banned') },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filters: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  card: { borderWidth: 1 },
});