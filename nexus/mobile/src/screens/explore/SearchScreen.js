import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, Dimensions, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { searchApi } from '../../api/search.api';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import useDebounce from '../../hooks/useDebounce';
import { storage } from '../../utils/storage';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');
const TILE = (width - 8) / 3;

const TABS = [
  { key: 'top', label: 'Top' },
  { key: 'users', label: 'Accounts' },
  { key: 'posts', label: 'Posts' },
  { key: 'vibes', label: 'Vibes' },
  { key: 'hashtags', label: 'Tags' },
  { key: 'communities', label: 'Communities' },
  { key: 'channels', label: 'Channels' },
];

export default function SearchScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();

  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 350);
  const [tab, setTab] = useState('top');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [recent, setRecent] = useState([]);

  // Load recent searches on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.get('nova_recent_searches');
      if (Array.isArray(saved)) setRecent(saved.slice(0, 10));
    })();
  }, []);

  const saveRecent = useCallback(async (term) => {
    if (!term.trim()) return;
    const next = [term.trim(), ...recent.filter((r) => r !== term.trim())].slice(0, 10);
    setRecent(next);
    await storage.set('nova_recent_searches', next);
  }, [recent]);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await searchApi.search(q.trim());
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounced.trim()) runSearch(debounced);
    else setResults(null);
  }, [debounced, runSearch]);

  const onSubmit = () => {
    if (query.trim()) saveRecent(query.trim());
  };

  // ── Aggregators per tab ──
  const lists = useMemo(() => {
    if (!results) return {};
    const users = results.users || [];
    const posts = results.posts || [];
    const vibes = results.vibes || [];
    const hashtags = results.hashtags || [];
    const communities = results.communities || [];
    const channels = results.channels || [];

    return {
      users,
      posts,
      vibes,
      hashtags,
      communities,
      channels,
      // "Top" is a mixed preview
      top: {
        users: users.slice(0, 6),
        posts: posts.slice(0, 9),
        vibes: vibes.slice(0, 3),
        hashtags: hashtags.slice(0, 8),
      },
    };
  }, [results]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Search input row */}
      <View style={[styles.searchRow, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>

        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 12,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmit}
            placeholder="Search Nova"
            placeholderTextColor={colors.textDim}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.input, { color: colors.text }]}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      {results ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: 8, gap: 8 }}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.nexusBlue : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? '#fff' : colors.text,
                    fontWeight: '700',
                    fontSize: 13,
                    includeFontPadding: false,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Body */}
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : !results ? (
        <RecentSearches
          recent={recent}
          onClear={async () => {
            setRecent([]);
            await storage.remove('nova_recent_searches');
          }}
          onTap={(t) => setQuery(t)}
        />
      ) : (
        <Body
          tab={tab}
          lists={lists}
          navigation={navigation}
          onPickUser={(id) => navigation.navigate(ROUTES.USER_PROFILE, { userId: id })}
          onPickPost={(id) => navigation.navigate(ROUTES.POST_DETAIL, { postId: id })}
          onPickVibe={(id) => navigation.navigate(ROUTES.VIBES, { initialId: id })}
          onPickTag={(tag) => navigation.navigate(ROUTES.HASHTAG, { tag })}
          onPickCommunity={(id) => navigation.navigate(ROUTES.COMMUNITY, { communityId: id })}
          onPickChannel={(id) => navigation.navigate(ROUTES.CHANNEL, { channelId: id })}
        />
      )}
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────────────────── */

function RecentSearches({ recent, onTap, onClear }) {
  const { colors, spacing } = useTheme();
  if (!recent.length) {
    return (
      <EmptyState
        emoji="🔍"
        title="Search Nova"
        subtitle="Find people, posts, vibes, hashtags, communities, and channels."
      />
    );
  }
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md }}>
      <View style={styles.recentHeader}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>
          Recent
        </Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={{ color: colors.electricBlue, fontSize: 13, fontWeight: '700' }}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
      {recent.map((term, i) => (
        <TouchableOpacity
          key={`${term}-${i}`}
          onPress={() => onTap(term)}
          style={styles.recentRow}
        >
          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          <Text style={{ color: colors.text, marginLeft: 12, fontSize: 14 }}>{term}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function Body({
  tab,
  lists,
  onPickUser,
  onPickPost,
  onPickVibe,
  onPickTag,
  onPickCommunity,
  onPickChannel,
}) {
  const { colors, spacing } = useTheme();

  if (tab === 'users') {
    return <UserList users={lists.users} onPick={onPickUser} />;
  }
  if (tab === 'posts') {
    return <MediaGrid items={lists.posts} kind="posts" onPick={onPickPost} />;
  }
  if (tab === 'vibes') {
    return <MediaGrid items={lists.vibes} kind="vibes" onPick={onPickVibe} />;
  }
  if (tab === 'hashtags') {
    return <TagList tags={lists.hashtags} onPick={onPickTag} />;
  }
  if (tab === 'communities') {
    return <NamedList items={lists.communities} onPick={onPickCommunity} emoji="🏛️" />;
  }
  if (tab === 'channels') {
    return <NamedList items={lists.channels} onPick={onPickChannel} emoji="📢" />;
  }

  // Top — mixed layout
  const t = lists.top || { users: [], posts: [], vibes: [], hashtags: [] };
  const total = t.users.length + t.posts.length + t.vibes.length + t.hashtags.length;

  if (!total) {
    return <EmptyState emoji="🤔" title="No results" subtitle="Try a different search." />;
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
      {t.users.length ? (
        <>
          <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
            ACCOUNTS
          </Text>
          {t.users.map((u) => (
            <UserRow key={u._id} user={u} onPress={() => onPickUser(u._id)} />
          ))}
        </>
      ) : null}

      {t.posts.length ? (
        <>
          <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
            POSTS
          </Text>
          <MediaGrid items={t.posts} kind="posts" onPick={onPickPost} noScroll />
        </>
      ) : null}

      {t.vibes.length ? (
        <>
          <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
            VIBES
          </Text>
          <MediaGrid items={t.vibes} kind="vibes" onPick={onPickVibe} noScroll />
        </>
      ) : null}

      {t.hashtags.length ? (
        <>
          <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
            HASHTAGS
          </Text>
          <TagList tags={t.hashtags} onPick={onPickTag} noScroll />
        </>
      ) : null}
    </ScrollView>
  );
}

function UserList({ users, onPick }) {
  if (!users?.length) return <EmptyState emoji="👥" title="No accounts found" />;
  return (
    <FlatList
      data={users}
      keyExtractor={(i) => i._id}
      renderItem={({ item }) => <UserRow user={item} onPress={() => onPick(item._id)} />}
    />
  );
}

function UserRow({ user, onPress }) {
  const { colors, spacing } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.userRow, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
      activeOpacity={0.75}
    >
      <Avatar uri={user.profilePicture} name={user.fullName} size={46} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{user.fullName}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{user.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
    </TouchableOpacity>
  );
}

function MediaGrid({ items, kind, onPick, noScroll }) {
  if (!items?.length) {
    return (
      <EmptyState
        emoji={kind === 'vibes' ? '🎬' : '🖼️'}
        title={`No ${kind} found`}
        compact
      />
    );
  }
  const List = noScroll ? View : FlatList;
  return (
    <List
      style={{ paddingHorizontal: 2 }}
      {...(noScroll ? { style: { flexDirection: 'row', flexWrap: 'wrap' } } : {})}
    >
      {items.map((it) => {
        const media =
          it.media?.[0]?.url ||
          it.videoUrl ||
          it.thumbnail ||
          null;
        return (
          <TouchableOpacity
            key={it._id}
            onPress={() => onPick(it._id)}
            style={{ width: TILE, height: TILE, margin: 2, borderRadius: 8, overflow: 'hidden' }}
            activeOpacity={0.85}
          >
            {media ? (
              <Image source={{ uri: media }} style={{ flex: 1 }} resizeMode="cover" />
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#1a1a2a',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}
              >
                <Text
                  numberOfLines={4}
                  style={{ color: '#94A3B8', fontSize: 11, textAlign: 'center' }}
                >
                  {it.caption || 'Text'}
                </Text>
              </View>
            )}
            {kind === 'vibes' ? (
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>VIBE</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </List>
  );
}

function TagList({ tags, onPick, noScroll }) {
  const { colors, spacing } = useTheme();
  if (!tags?.length) return <EmptyState emoji="🏷️" title="No hashtags found" compact />;
  const Container = noScroll ? View : FlatList;
  return (
    <Container
      {...(noScroll
        ? { style: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md } }
        : {})}
      data={noScroll ? undefined : tags}
      keyExtractor={noScroll ? undefined : (i) => i._id || i.tag}
      renderItem={noScroll ? undefined : ({ item }) => (
        <TouchableOpacity
          onPress={() => onPick(item.tag)}
          style={[styles.tagRow, { borderBottomColor: colors.border }]}
        >
          <View
            style={[
              styles.tagCircle,
              { backgroundColor: colors.card, marginRight: 12 },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: '800' }}>#</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>#{item.tag}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              {item.postsCount || 0} posts
            </Text>
          </View>
        </TouchableOpacity>
      )}
    >
      {noScroll
        ? tags.map((tag) => (
            <TouchableOpacity
              key={tag._id || tag.tag}
              onPress={() => onPick(tag.tag)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>#{tag.tag}</Text>
            </TouchableOpacity>
          ))
        : null}
    </Container>
  );
}

function NamedList({ items, onPick, emoji }) {
  const { colors, spacing } = useTheme();
  if (!items?.length) {
    return <EmptyState emoji={emoji} title="No results" compact />;
  }
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i._id}
      contentContainerStyle={{ padding: spacing.md }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onPick(item._id)}
          style={styles.userRow}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.tagCircle,
              { backgroundColor: colors.card, width: 46, height: 46, borderRadius: 23 },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
            {item.description ? (
              <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 15,
    includeFontPadding: false,
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  section: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tagCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});