import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { conversationsApi } from '../../api/conversations.api';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import useDebounce from '../../hooks/useDebounce';
import { ROUTES } from '../../constants/routes';

export default function NewChatScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 350);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) return setResults([]);
    setLoading(true);
    try {
      const res = await usersApi.search(query.trim());
      setResults((res.users || []).filter((u) => u._id !== user?.id));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    search(debounced);
  }, [debounced, search]);

  async function startChat(participant) {
    setStarting(participant._id);
    try {
      const res = await conversationsApi.create(participant._id);
      navigation.replace(ROUTES.CHAT, { conversation: res.conversation });
    } catch {
      // ignore
    } finally {
      setStarting(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="New chat"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.md }}>
        <Input
          placeholder="Search by name or @username"
          autoCapitalize="none"
          autoCorrect={false}
          value={q}
          onChangeText={setQ}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
              onPress={() => startChat(item)}
              disabled={!!starting}
            >
              <Avatar uri={item.profilePicture} name={item.fullName} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.fullName}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{item.username}</Text>
              </View>
              {starting === item._id ? (
                <ActivityIndicator color={colors.electricBlue} />
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            q.trim() ? (
              <EmptyState
                emoji="🔍"
                title="No users found"
                subtitle="Try a different name or username."
                compact
              />
            ) : (
              <EmptyState
                emoji="✍️"
                title="Find someone to message"
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