import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import UserRow from '../../components/profile/UserRow';
import { ROUTES } from '../../constants/routes';

export default function FollowersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};
  const { user: me } = useAuth();
  const isMe = !userId || String(userId) === String(me?.id);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await usersApi.followers(userId || me?.id);
      setItems(res.followers || []);
    } catch (e) {
      Alert.alert('Could not load followers', e?.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, me?.id]);

  useEffect(() => { load(); }, [load]);

  async function removeFollower(followerId) {
    Alert.alert('Remove follower?', 'They will no longer follow you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersApi.removeFollower(followerId);
            setItems((list) => list.filter((u) => u._id !== followerId));
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
        title="Followers"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.electricBlue}
            />
          }
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => navigation.navigate(ROUTES.USER_PROFILE, { userId: item._id })}
              actionLabel={isMe ? 'Remove' : undefined}
              onAction={isMe ? () => removeFollower(item._id) : undefined}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="👥"
              title="No followers yet"
              subtitle="When people follow this account, they'll appear here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });