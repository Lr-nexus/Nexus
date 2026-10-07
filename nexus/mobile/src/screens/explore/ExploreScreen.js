import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions,
  RefreshControl, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { searchApi } from '../../api/search.api';
import { postsApi } from '../../api/posts.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const { width } = Dimensions.get('window');
const TILE = (width - 6) / 3;

export default function ExploreScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, t] = await Promise.all([
        postsApi.feed({ limit: 30 }),
        searchApi.trending(),
      ]);
      setPosts(p.posts || []);
      setTrending(t.hashtags || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Explore"
        rightIcons={[
          { icon: <Text style={{ fontSize: 20 }}>🔎</Text>, onPress: () => navigation.navigate('Search') },
        ]}
      />

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(i) => i._id}
          numColumns={3}
          ListHeaderComponent={
            trending.length ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
                  TRENDING
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
                >
                  {trending.map((h) => (
                    <TouchableOpacity
                      key={h._id || h.tag}
                      onPress={() => navigation.navigate('Hashtag', { tag: h.tag })}
                      style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>
                        #{h.tag}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                        {h.postsCount || 0} posts
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md, marginTop: 16 }]}>
                  DISCOVER
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const media = item.media?.[0]?.url;
            return (
              <TouchableOpacity
                style={{ width: TILE, height: TILE, margin: 1 }}
                onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
              >
                {media ? (
                  <Image source={{ uri: media }} style={{ flex: 1 }} resizeMode="cover" />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                    }}
                  >
                    <Text numberOfLines={4} style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                      {item.caption || 'Text post'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              emoji="🧭"
              title="Nothing to explore yet"
              subtitle="Check back after more people post."
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.electricBlue}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, minWidth: 90 },
});