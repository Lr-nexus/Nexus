import React, { useCallback, useState } from 'react';
import {
  View, FlatList, RefreshControl, StyleSheet, Alert,
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
import BottomSheet from '../../components/common/BottomSheet';
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
  const [composeOpen, setComposeOpen] = useState(false);

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
            onPress: () => setComposeOpen(true),
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
              subtitle="Start a chat or create a group."
              actionLabel="Start new chat"
              onAction={() => setComposeOpen(true)}
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

      <BottomSheet
        visible={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Start something new"
        items={[
          {
            label: '💬  New chat',
            onPress: () => navigation.navigate(ROUTES.NEW_CHAT),
          },
          {
            label: '👥  New group',
            onPress: () => navigation.navigate(ROUTES.CREATE_GROUP),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});