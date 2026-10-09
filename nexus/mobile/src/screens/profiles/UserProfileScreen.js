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

  const load = useCallback(async () => {
    try {
      const [u, p] = await Promise.all([
        usersApi.get(userId),
        postsApi.byUser(userId, { limit: 30 }),
      ]);
      setUser(u.user);
      setPosts(p.posts || []);
    } catch {} finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

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
            postsCount={posts.length}
            followersCount={user?.followersCount || 0}
            followingCount={user?.followingCount || 0}
            onFollow={() => setFollowing((v) => !v)}
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