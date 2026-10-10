import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { usersApi } from '../../api/users.api';
import { postsApi } from '../../api/posts.api';
import { conversationsApi } from '../../api/conversations.api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');
const TILE = (width - 6) / 3;

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, fs] = await Promise.all([
        usersApi.get(userId),
        postsApi.byUser(userId, { limit: 30 }),
        usersApi.followStatus(userId),
      ]);
      setUser({
        ...u.user,
        followersCount: fs.followersCount,
        followingCount: fs.followingCount,
      });
      setPosts(p.posts || []);
      setFollowing(fs.following);
      setRequested(fs.requested);
    } catch (e) {
      Alert.alert('Could not load profile', e?.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function toggleFollow() {
    if (busy) return;
    setBusy(true);
    try {
      if (following) {
        await usersApi.unfollow(userId);
        setFollowing(false);
        setRequested(false);
        setUser((u) => ({ ...u, followersCount: Math.max(0, (u.followersCount || 0) - 1) }));
      } else if (requested) {
        await usersApi.unfollow(userId);
        setRequested(false);
      } else {
        const res = await usersApi.follow(userId);
        if (res.requested) {
          setRequested(true);
        } else {
          setFollowing(true);
          setUser((u) => ({ ...u, followersCount: (u.followersCount || 0) + 1 }));
        }
      }
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function message() {
    try {
      const res = await conversationsApi.create(userId);
      navigation.navigate(ROUTES.CHAT, { conversation: res.conversation });
    } catch (e) {
      Alert.alert('Could not open chat', e?.response?.data?.message || 'Try again.');
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title={user?.username || 'Profile'}
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />
      <FlatList
        data={posts}
        keyExtractor={(i) => i._id}
        numColumns={3}
        ListHeaderComponent={
          <ProfileHeader
            user={user}
            following={following}
            followRequested={requested}
            postsCount={posts.length}
            followersCount={user?.followersCount || 0}
            followingCount={user?.followingCount || 0}
            onFollow={toggleFollow}
            onMessage={message}
            onFollowers={() => navigation.navigate(ROUTES.FOLLOWERS, { userId })}
            onFollowing={() => navigation.navigate(ROUTES.FOLLOWING, { userId })}
          />
        }
        ListEmptyComponent={<EmptyState emoji="🖼️" title="No posts yet" compact />}
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });