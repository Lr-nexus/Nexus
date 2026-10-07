import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function RizzHistoryScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await rizzApi.history();
      setItems(res.conversations || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function confirmDelete(id) {
    Alert.alert('Delete conversation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await rizzApi.deleteHistory(id);
            setItems((s) => s.filter((x) => x._id !== id));
          } catch {}
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Rizz history"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => confirmDelete(item._id)}
              onPress={() => navigation.navigate('RizzChat', { mode: 'chat' })}
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
              <Text style={{ fontSize: 20, marginRight: 12 }}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
                  {item.title || 'Untitled chat'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {formatDate(item.updatedAt || item.createdAt)}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted }}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="🕘"
              title="No Rizz history"
              subtitle="Your AI conversations will appear here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 } });