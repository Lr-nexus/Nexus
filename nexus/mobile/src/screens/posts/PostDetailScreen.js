import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { postsApi } from '../../api/posts.api';
import Avatar from '../../components/common/Avatar';
import PostActions from '../../components/posts/PostActions';
import PostComment from '../../components/posts/PostComment';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function PostDetailScreen({ route, navigation }) {
  const { postId, focusComments } = route.params || {};
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([postsApi.get(postId), postsApi.comments(postId)]);
      setPost(p.post);
      setComments(c.comments || []);
    } catch {} finally { setLoading(false); }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (focusComments) setTimeout(() => inputRef.current?.focus(), 350);
  }, [focusComments]);

  async function toggleLike() {
    if (!post) return;
    const prev = post;
    setPost({ ...post, likedByMe: !post.likedByMe });
    try {
      const res = await postsApi.like(post._id);
      setPost((p) => ({ ...p, likedByMe: res.liked, likes: Array(res.likes).fill(0) }));
    } catch { setPost(prev); }
  }

  async function sendComment() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await postsApi.comment(postId, text.trim());
      setComments((c) => [res.comment, ...c]);
      setText('');
      setPost((p) => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 }));
    } catch {} finally { setSending(false); }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }
  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <EmptyState emoji="🚫" title="Post unavailable" />
      </SafeAreaView>
    );
  }

  const author = post.authorId || {};

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ color: colors.text, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
            <Avatar uri={author.profilePicture} name={author.fullName} size={40} />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{author.fullName}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                @{author.username} · {timeAgo(post.createdAt)}
              </Text>
            </View>
          </View>

          {post.caption ? (
            <Text style={{ color: colors.text, paddingHorizontal: 12, paddingBottom: 12, lineHeight: 21 }}>
              {post.caption}
            </Text>
          ) : null}

          {post.media?.map((m, i) => m.url ? (
            <Image key={i} source={{ uri: m.url }} style={{ width, height: width, marginBottom: 6 }} resizeMode="cover" />
          ) : null)}

          <View style={{ paddingHorizontal: 12 }}>
            <PostActions
              liked={!!post.likedByMe}
              likesCount={post.likes?.length || 0}
              commentsCount={post.commentsCount || 0}
              saved={!!post.savedByMe}
              onLike={toggleLike}
              onComment={() => inputRef.current?.focus()}
              onShare={() => {}}
              onSave={() => postsApi.save(post._id).catch(() => {})}
            />
          </View>

          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Comments · {comments.length}</Text>
            {comments.length === 0 ? (
              <Text style={{ color: colors.textDim, paddingVertical: 20, textAlign: 'center' }}>Be the first to comment.</Text>
            ) : (
              comments.map((c) => <PostComment key={c._id} comment={c} onLike={() => {}} onReply={() => {}} />)
            )}
          </View>
        </ScrollView>

        <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <Avatar uri={user?.profilePicture} name={user?.fullName} size={34} />
          <TextInput
            ref={inputRef} value={text} onChangeText={setText}
            placeholder="Add a comment…" placeholderTextColor={colors.textDim}
            style={[styles.composerInput, { backgroundColor: colors.bg, color: colors.text, borderRadius: radius.pill }]}
          />
          <TouchableOpacity onPress={sendComment} disabled={!text.trim() || sending}
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.nexusBlue : colors.card, borderRadius: radius.pill }]}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> :
              <Text style={{ color: text.trim() ? '#fff' : colors.textDim, fontWeight: '800' }}>↑</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, marginBottom: 8 },
  composer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, gap: 8 },
  composerInput: { flex: 1, height: 40, paddingHorizontal: 16, fontSize: 14 },
  sendBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});