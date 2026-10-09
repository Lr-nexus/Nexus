import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, ScrollView,
  TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../../api/posts.api';
import { storiesApi } from '../../api/stories.api';
import PostCard from '../../components/posts/PostCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonPost } from '../../components/common/Skeleton';
import Avatar from '../../components/common/Avatar';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');
const CARD_W = (width - 12 * 3) / 2;

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, s] = await Promise.all([
        postsApi.feed({ limit: 20 }),
        storiesApi.feed(),
      ]);
      setPosts(p.posts || []);
      setStories(s.stories || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const header = (
    <>
      {/* ── Dedicated search bar (Instagram-style) ── */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.md, paddingTop: 4 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.SEARCH)}
          activeOpacity={0.85}
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 12,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textDim,
              marginLeft: 10,
              fontSize: 15,
              includeFontPadding: false,
            }}
          >
            Search Nova
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top row (brand + notifications) */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.md, marginTop: 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.MY_PROFILE)}
          style={styles.brandRow}
        >
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandMark}
          >
            <Text style={styles.brandText}>N</Text>
          </LinearGradient>
          <Text style={[styles.brandName, { color: colors.text }]}>Nova</Text>
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MY_PROFILE)}>
            <Avatar uri={user?.profilePicture} name={user?.fullName} size={40} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Section label */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text, paddingHorizontal: spacing.md, marginTop: 18 },
        ]}
      >
        Your Circle
      </Text>

      {/* Stories row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: 8, gap: 12 }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.CREATE_STORY)}
          style={styles.storyAdd}
        >
          <View style={[styles.storyAddCircle, { borderColor: colors.border }]}>
            <Ionicons name="add" size={28} color={colors.text} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
            Add Show
          </Text>
        </TouchableOpacity>

        {stories.map((story, idx) => (
          <TouchableOpacity
            key={story._id}
            onPress={() =>
              navigation.navigate(ROUTES.STORY_VIEW, { stories, initialIndex: idx })
            }
            style={styles.storyItem}
          >
            <Avatar
              uri={story.authorId?.profilePicture}
              name={story.authorId?.fullName}
              size={62}
              ring
              ringColor={colors.electricBlue}
            />
            <Text
              numberOfLines={1}
              style={{ color: colors.textMuted, fontSize: 11, marginTop: 6, maxWidth: 66 }}
            >
              {story.authorId?.username || story.authorId?.fullName?.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Discover */}
      <View style={styles.discoverHeader}>
        <Text
          style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: spacing.md }]}
        >
          Discover
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.EXPLORE)}>
          <Text style={{ color: colors.electricBlue, fontWeight: '700', fontSize: 12 }}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 12, paddingBottom: 8 }}
      >
        {posts.slice(0, 5).map((p) => (
          <TouchableOpacity
            key={p._id}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(ROUTES.POST_DETAIL, { postId: p._id })}
            style={[styles.discoverCard, { borderColor: colors.border }]}
          >
            {p.media?.[0]?.url ? (
              <Image
                source={{ uri: p.media[0].url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.discoverInfo}>
              <Text numberOfLines={1} style={styles.discoverName}>
                {p.authorId?.fullName || 'Nova user'}
              </Text>
              <Text numberOfLines={2} style={styles.discoverCaption}>
                {p.caption || 'Text post'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text, paddingHorizontal: spacing.md, marginTop: 12 },
        ]}
      >
        From people you follow
      </Text>
    </>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      {loading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonPost />
          <SkeletonPost />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(i) => i._id}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onChange={(id, patch) =>
                setPosts((list) =>
                  list.map((p) => (p._id === id ? { ...p, ...patch } : p))
                )
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="🌱"
              title="Your feed is quiet"
              subtitle="Follow people or create the first post."
              actionLabel="Create a post"
              onAction={() => navigation.navigate(ROUTES.CREATE_POST)}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.electricBlue}
            />
          }
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: '#fff', fontSize: 18, fontWeight: '900', includeFontPadding: false },
  brandName: { fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  storyAdd: { alignItems: 'center' },
  storyAddCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyItem: { alignItems: 'center' },
  discoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    marginBottom: 6,
  },
  discoverCard: {
    width: CARD_W + 40,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  discoverInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  discoverName: { color: '#fff', fontWeight: '800', fontSize: 14 },
  discoverCaption: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
});