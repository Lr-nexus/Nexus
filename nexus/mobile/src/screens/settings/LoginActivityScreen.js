import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { authApi } from '../../api/auth.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function LoginActivityScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await authApi.sessions();
      setSessions(res.sessions || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function revoke(id) {
    Alert.alert('Log out this device?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.revokeSession(id);
            setSessions((s) => s.filter((x) => x._id !== id));
          } catch (e) {
            Alert.alert('Failed', e?.response?.data?.message || 'Try again.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Login activity"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>
                  {item.deviceName || item.platform || 'Unknown device'}
                </Text>
                {!item.revokedAt ? (
                  <View
                    style={{
                      backgroundColor: colors.success,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>ACTIVE</Text>
                  </View>
                ) : (
                  <Text style={{ color: colors.textDim, fontSize: 11 }}>revoked</Text>
                )}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
                {item.platform} · Last active {formatDate(item.lastActiveAt)}
              </Text>
              {!item.revokedAt ? (
                <TouchableOpacity onPress={() => revoke(item._id)} style={{ marginTop: 10 }}>
                  <Text style={{ color: colors.danger, fontWeight: '700' }}>Log out</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <EmptyState emoji="🔒" title="No active sessions" subtitle="You're signed in only on this device." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });