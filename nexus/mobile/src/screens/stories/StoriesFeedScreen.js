import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storiesApi } from '../../api/stories.api';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonRow } from '../../components/common/Skeleton';
import { ROUTES } from '../../constants/routes';

export default function StoriesFeedScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await storiesApi.feed();
      setStories(res.stories || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load stories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openStory(index) {
    navigation.navigate(ROUTES.STORY_VIEW, { stories, initialIndex: index });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Stories</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.CREATE_STORY)} hitSlop={10}>
          <Ionicons name="add" size={26} color={colors.electricBlue} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonRow count={4} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : stories.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="No stories yet"
          subtitle="Post the first story to get the ball rolling."
          actionLabel="Create story"
          onAction={() => navigation.navigate(ROUTES.CREATE_STORY)}
        />
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(i) => i._id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.sm }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.electricBlue}
            />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => openStory(index)}
              activeOpacity={0.85}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {item.media?.url ? (
                <View style={[styles.cardMedia, { backgroundColor: colors.card }]}>
                  <Ionicons
                    name={item.type === 'video' ? 'videocam' : 'image'}
                    size={28}
                    color={colors.textMuted}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.cardMedia,
                    { backgroundColor: item.textStyle?.background || colors.nexusBlue },
                  ]}
                >
                  <Text
                    numberOfLines={4}
                    style={{ color: '#fff', fontWeight: '700', padding: 8, textAlign: 'center' }}
                  >
                    {item.text}
                  </Text>
                </View>
              )}
              <View style={styles.cardFooter}>
                <Avatar uri={item.authorId?.profilePicture} name={item.authorId?.fullName} size={26} />
                <Text
                  numberOfLines={1}
                  style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: 6, flex: 1 }}
                >
                  @{item.authorId?.username || 'user'}
                </Text>
                <Text style={{ color: colors.textDim, fontSize: 10 }}>
                  {item.viewsCount || 0} 👁
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '800' },
  card: { flex: 1, margin: 6, borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  cardMedia: { height: 180, alignItems: 'center', justifyContent: 'center' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: 8 },
});