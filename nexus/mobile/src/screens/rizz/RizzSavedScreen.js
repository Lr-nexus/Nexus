import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function RizzSavedScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await rizzApi.saved();
      setItems(res.saved || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function copy(text) {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied to clipboard');
  }

  function confirmDelete(id) {
    Alert.alert('Delete saved response?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await rizzApi.deleteSaved(id);
            setItems((s) => s.filter((x) => x._id !== id));
          } catch {}
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Saved responses"
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
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={{ color: colors.text, lineHeight: 21 }} selectable>
                {item.content}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 14 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, textTransform: 'capitalize' }}>
                  {item.style || 'smooth'}
                </Text>
                <Text style={{ color: colors.textDim, fontSize: 11 }}>
                  {formatDate(item.createdAt)}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => copy(item.content)}>
                  <Text style={{ color: colors.electricBlue, fontWeight: '700', fontSize: 12 }}>
                    Copy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item._id)}>
                  <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12 }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="⭐️"
              title="No saved responses"
              subtitle="Tap Save on any Rizz response to keep it here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, card: { borderWidth: 1 } });