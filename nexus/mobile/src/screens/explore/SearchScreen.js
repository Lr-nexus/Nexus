import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { searchApi } from '../../api/search.api';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import useDebounce from '../../hooks/useDebounce';

export default function SearchScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 350);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (query) => {
    if (!query.trim()) { setRes(null); return; }
    setLoading(true);
    try {
      const data = await searchApi.search(query.trim());
      setRes(data);
    } catch { setRes(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { run(debounced); }, [debounced, run]);

  const sections = res
    ? [
        res.users?.length && {
          title: 'Users',
          data: res.users.map((u) => ({ ...u, __type: 'user' })),
        },
        res.hashtags?.length && {
          title: 'Hashtags',
          data: res.hashtags.map((h) => ({ ...h, __type: 'hashtag' })),
        },
        res.communities?.length && {
          title: 'Communities',
          data: res.communities.map((c) => ({ ...c, __type: 'community' })),
        },
        res.channels?.length && {
          title: 'Channels',
          data: res.channels.map((c) => ({ ...c, __type: 'channel' })),
        },
        res.posts?.length && {
          title: 'Posts',
          data: res.posts.map((p) => ({ ...p, __type: 'post' })),
        },
      ].filter(Boolean)
    : [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Search"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.md }}>
        <Input
          placeholder="Search people, hashtags, communities…"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          value={q}
          onChangeText={setQ}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
      ) : !res ? (
        <EmptyState emoji="🔍" title="Start typing to search" subtitle="People, hashtags, communities, channels and posts." />
      ) : sections.length === 0 ? (
        <EmptyState emoji="🕵️" title="No results" subtitle={`Nothing matched “${q}”.`} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(i, idx) => i._id || `${idx}`}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <Row
              item={item}
              onPress={(kind, payload) => {
                if (kind === 'user') navigation.navigate('UserProfile', { userId: payload._id });
                else if (kind === 'hashtag') navigation.navigate('Hashtag', { tag: payload.tag });
                else if (kind === 'post') navigation.navigate('PostDetail', { postId: payload._id });
                else if (kind === 'community') navigation.navigate('Community', { communityId: payload._id });
                else if (kind === 'channel') navigation.navigate('Channel', { channelId: payload._id });
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function Row({ item, onPress }) {
  const { colors, spacing } = useTheme();
  const t = item.__type;

  if (t === 'user') {
    return (
      <TouchableOpacity
        style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
        onPress={() => onPress('user', item)}
      >
        <Avatar uri={item.profilePicture} name={item.fullName} size={42} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{item.fullName}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (t === 'hashtag') {
    return (
      <TouchableOpacity
        style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
        onPress={() => onPress('hashtag', item)}
      >
        <View style={[styles.tagCircle, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>#</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>#{item.tag}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.postsCount || 0} posts</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const label =
    t === 'post' ? item.caption?.slice(0, 60) || 'Post'
    : t === 'community' ? item.name
    : item.name;

  const goTo = t;

  return (
    <TouchableOpacity
      style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
      onPress={() => onPress(goTo, item)}
    >
      <View style={[styles.tagCircle, { backgroundColor: colors.card }]}>
        <Text style={{ fontSize: 16 }}>
          {t === 'community' ? '🏛️' : t === 'channel' ? '📢' : '🖼️'}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginTop: 14, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  tagCircle: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
});