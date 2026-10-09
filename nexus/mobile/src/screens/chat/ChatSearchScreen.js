import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { conversationsApi } from '../../api/conversations.api';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function ChatSearchScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversation } = route.params || {};

  const [q, setQ] = useState('');
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await conversationsApi.messages(conversation._id, { limit: 200 });
        setAll(res.messages || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [conversation?._id]);

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? all.filter((m) => (m.content || '').toLowerCase().includes(needle))
    : [];

  const highlight = useCallback((text = '') => {
    if (!needle || !text) return text;
    const idx = text.toLowerCase().indexOf(needle);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <Text style={{ backgroundColor: colors.warning, color: '#111' }}>
          {text.slice(idx, idx + needle.length)}
        </Text>
        {text.slice(idx + needle.length)}
      </>
    );
  }, [needle, colors.warning]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Search in chat"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.md }}>
        <Input placeholder="Search messages…" autoFocus value={q} onChangeText={setQ} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
      ) : !needle ? (
        <EmptyState emoji="🔍" title="Search this chat" subtitle={`${all.length} messages available`} />
      ) : filtered.length === 0 ? (
        <EmptyState emoji="🙈" title="No matches" subtitle={`Nothing found for "${q}"`} compact />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: 8 },
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                {highlight(item.content)}
              </Text>
              <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 6 }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { borderWidth: 1 },
});