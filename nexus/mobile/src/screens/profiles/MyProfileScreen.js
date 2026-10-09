import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../../api/posts.api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EmptyState from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');
const TILE = (width - 6) / 3;

export default function MyProfileScreen() {
  const { colors, spacing } = useTheme();
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      await refreshUser();
      const res = await postsApi.mine({ limit: 50 });
      setPosts(res.posts || []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [refreshUser]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <FlatList
        data={posts}
        keyExtractor={(i) => i._id}
        numColumns={3}
        ListHeaderComponent={
          <>
            <ProfileHeader
              user={user}
              isMe
              postsCount={posts.length}
              followersCount={user?.followersCount || 0}
              followingCount={user?.followingCount || 0}
              onEdit={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
              onSettings={() => navigation.navigate(ROUTES.SETTINGS)}
              onFollowers={() => navigation.navigate(ROUTES.FOLLOWERS, { userId: user?.id })}
              onFollowing={() => navigation.navigate(ROUTES.FOLLOWING, { userId: user?.id })}
            />
            <Text style={[styles.tab, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
              POSTS
            </Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
          ) : (
            <EmptyState
              emoji="🌱"
              title="No posts yet"
              subtitle="Share your first post on Nova."
              actionLabel="Create post"
              onAction={() => navigation.navigate(ROUTES.CREATE_POST)}
              compact
            />
          )
        }
        renderItem={({ item }) => {
          const media = item.media?.[0]?.url;
          return (
            <TouchableOpacity
              style={{ width: TILE, height: TILE, margin: 1 }}
              onPress={() => navigation.navigate(ROUTES.POST_DETAIL, { postId: item._id })}
            >
              {media ? (
                <Image source={{ uri: media }} style={{ flex: 1 }} />
              ) : (
                <View
                  style={{
                    flex: 1, backgroundColor: colors.card,
                    alignItems: 'center', justifyContent: 'center', padding: 6,
                  }}
                >
                  <Text numberOfLines={3} style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                    {item.caption}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.electricBlue}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  tab: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginTop: 8, marginBottom: 6 },
});