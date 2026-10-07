import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { callsApi } from '../../api/calls.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function CallHistoryScreen() {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await callsApi.history();
      setCalls(res.calls || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Calls"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => {
            const other =
              item.callerId?._id === user?.id
                ? item.callerId
                : item.callerId;
            const outgoing = item.callerId?._id === user?.id;
            return (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: 8,
                  },
                ]}
              >
                <Avatar
                  uri={other?.profilePicture}
                  name={other?.fullName}
                  size={44}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {other?.fullName || 'Unknown'}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    {outgoing ? '↗️ Outgoing' : '↙️ Incoming'} · {item.type} ·{' '}
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <Text
                  style={{
                    color: item.status === 'missed' ? colors.danger : colors.textMuted,
                    fontSize: 12,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.status}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              emoji="📞"
              title="No calls yet"
              subtitle="Your call history will appear here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});