import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../common/Avatar';
import PostActions from './PostActions';
import { postsApi } from '../../api/posts.api';
import { useTheme } from '../../context/ThemeContext';
import { timeAgo } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');
const MEDIA_SIZE = width - 24;

export default function PostCard({ post: initial, onChange }) {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [post, setPost] = useState(initial);
  const [busy, setBusy] = useState(false);

  const author = post.authorId || {};
  const media = post.media?.[0];

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const prev = post;
    const willLike = !post.likedByMe;
    setPost({
      ...post,
      likedByMe: willLike,
      likes: Array((post.likes?.length || 0) + (willLike ? 1 : -1)).fill(0),
    });
    try {
      const res = await postsApi.like(post._id);
      setPost((p) => ({ ...p, likedByMe: res.liked, likes: Array(res.likes).fill(0) }));
      onChange?.(post._id, { likedByMe: res.liked, likes: Array(res.likes).fill(0) });
    } catch {
      setPost(prev);
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    const prev = post;
    setPost({ ...post, savedByMe: !post.savedByMe });
    try {
      await postsApi.save(post._id);
    } catch {
      setPost(prev);
    }
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginHorizontal: spacing.md,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={[styles.header, { padding: spacing.md }]}>
        <Avatar
          uri={author.profilePicture}
          name={author.fullName}
          size={42}
          onPress={() =>
            navigation.navigate(ROUTES.USER_PROFILE, { userId: author._id })
          }
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {author.fullName || 'Nova user'}
          </Text>
          <Text style={[styles.handle, { color: colors.textMuted }]} numberOfLines={1}>
            @{author.username || 'user'} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        {post.location ? (
          <Text style={{ color: colors.textDim, fontSize: 11 }} numberOfLines={1}>
            📍 {post.location}
          </Text>
        ) : null}
      </View>

      {post.type === 'text' && post.caption ? (
        <Text
          style={[
            styles.captionBig,
            { color: colors.text, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
          ]}
        >
          {post.caption}
        </Text>
      ) : null}

      {media?.url && post.type !== 'text' ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate(ROUTES.POST_DETAIL, { postId: post._id })}
        >
          <Image
            source={{ uri: media.url }}
            style={{ width: MEDIA_SIZE, height: MEDIA_SIZE, alignSelf: 'center' }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      {post.type !== 'text' && post.caption ? (
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
          <Text style={{ color: colors.text, lineHeight: 20 }} numberOfLines={3}>
            <Text style={{ fontWeight: '700' }}>{author.username} </Text>
            {post.caption}
          </Text>
        </View>
      ) : null}

      {post.hashtags?.length ? (
        <Text
          style={[
            styles.hashtags,
            { color: colors.electricBlue, paddingHorizontal: spacing.md, paddingTop: 6 },
          ]}
        >
          {post.hashtags.map((h) => `#${h}`).join(' ')}
        </Text>
      ) : null}

      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
        <PostActions
          liked={!!post.likedByMe}
          likesCount={post.likes?.length || 0}
          commentsCount={post.commentsCount || 0}
          saved={!!post.savedByMe}
          onLike={toggleLike}
          onComment={() =>
            navigation.navigate(ROUTES.POST_DETAIL, { postId: post._id, focusComments: true })
          }
          onShare={() => navigation.navigate(ROUTES.POST_DETAIL, { postId: post._id })}
          onSave={toggleSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 14 },
  handle: { fontSize: 12, marginTop: 1 },
  captionBig: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  hashtags: { fontSize: 13, fontWeight: '600' },
});