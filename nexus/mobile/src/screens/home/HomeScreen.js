import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../../api/posts.api';
import { storiesApi } from '../../api/stories.api';
import PostCard from '../../components/posts/PostCard';
import PostComposer from '../../components/posts/PostComposer';
import StoryCircle from '../../components/stories/StoryCircle';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonPost } from '../../components/common/Skeleton';
import Header from '../../components/common/Header';
import { ROUTES } from '../../constants/routes';

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

  const onRefresh = () => { setRefreshing(true); load(); };

  function openStories(index) {
    navigation.navigate(ROUTES.STORY_VIEW, { stories, initialIndex: index });
  }

  const header = (
    <>
      <PostComposer onPress={() => navigation.navigate(ROUTES.CREATE_POST)} />

      <View style={{ marginBottom: spacing.md }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}
        >
          <StoryCircle
            user={user}
            isOwn
            hasStory={false}
            onAddPress={() => navigation.navigate(ROUTES.CREATE_STORY)}
            onPress={() => navigation.navigate(ROUTES.CREATE_STORY)}
          />
          {stories.map((story, idx) => (
            <StoryCircle
              key={story._id}
              user={story.authorId}
              hasStory
              onPress={() => openStories(idx)}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="NOVA"
        subtitle="Connect. Chat. Share. Discover."
        rightIcons={[
          {
            icon: <Text style={{ fontSize: 20 }}>🔔</Text>,
            onPress: () => navigation.navigate(ROUTES.NOTIFICATIONS),
          },
          {
            icon: <Text style={{ fontSize: 20 }}>🔎</Text>,
            onPress: () => navigation.navigate(ROUTES.SEARCH),
          },
        ]}
      />

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
                setPosts((list) => list.map((p) => (p._id === id ? { ...p, ...patch } : p)))
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
              onRefresh={onRefresh}
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
});