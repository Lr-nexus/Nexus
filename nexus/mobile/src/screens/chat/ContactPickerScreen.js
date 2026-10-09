import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { conversationsApi } from '../../api/conversations.api';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import useDebounce from '../../hooks/useDebounce';

export default function ContactPickerScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId } = route.params || {};

  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const search = useCallback(async (query) => {
    if (!query.trim()) return setResults([]);
    setLoading(true);
    try {
      const res = await usersApi.search(query.trim());
      setResults((res.users || []).filter((u) => u._id !== user?.id));
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { search(debounced); }, [debounced, search]);

  async function pick(contact) {
    if (!conversationId) return navigation.goBack();
    setSending(true);
    try {
      await conversationsApi.send(conversationId, {
        type: 'contact',
        content: contact.username,
        media: {
          url: contact.profilePicture || '',
          name: contact.fullName,
        },
      });
      navigation.goBack();
    } catch (e) {
      // ignore
    } finally { setSending(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Share a contact"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.md }}>
        <Input
          placeholder="Search Nova users…"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          value={q}
          onChangeText={setQ}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { paddingVertical: 10 }]}
              onPress={() => pick(item)}
              disabled={sending}
            >
              <Avatar uri={item.profilePicture} name={item.fullName} size={46} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.fullName}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{item.username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            q.trim() ? (
              <EmptyState emoji="🔍" title="No users found" compact />
            ) : (
              <EmptyState
                emoji="👥"
                title="Pick a Nova user"
                subtitle="Search by name or @username."
                compact
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
});