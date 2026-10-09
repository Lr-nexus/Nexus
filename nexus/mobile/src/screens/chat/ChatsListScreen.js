import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { conversationsApi } from '../../api/conversations.api';
import ChatListItem from '../../components/chat/ChatListItem';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonRow } from '../../components/common/Skeleton';
import { ROUTES } from '../../constants/routes';

export default function ChatsListScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await conversationsApi.list();
      setItems(res.conversations || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Chats"
        rightIcons={[
          {
            icon: <Ionicons name="search-outline" size={22} color={colors.text} />,
            onPress: () => navigation.navigate(ROUTES.SEARCH),
          },
          {
            icon: <Ionicons name="create-outline" size={22} color={colors.text} />,
            onPress: () => navigation.navigate(ROUTES.NEW_CHAT),
          },
        ]}
      />

      {loading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonRow count={6} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <ChatListItem
              item={item}
              currentUserId={user?.id}
              onPress={() => navigation.navigate(ROUTES.CHAT, { conversation: item })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="💬"
              title="No conversations yet"
              subtitle="Start a chat with someone in your network."
              actionLabel="Start new chat"
              onAction={() => navigation.navigate(ROUTES.NEW_CHAT)}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.electricBlue}
            />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});