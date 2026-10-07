import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { vibesApi } from '../../api/vibes.api';
import { timeAgo } from '../../utils/formatDate';

export default function VibeComments({ vibeId, onClose }) {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await vibesApi.comments(vibeId);
        setComments(res.comments || []);
      } catch {} finally { setLoading(false); }
    })();
  }, [vibeId]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await vibesApi.comment(vibeId, text.trim());
      setComments((c) => [res.comment, ...c]);
      setText('');
    } catch {} finally { setSending(false); }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.sheet,
        { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
      ]}
    >
      <View style={[styles.grabber, { backgroundColor: colors.border }]} />
      <View style={styles.header}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>
          {comments.length} comment{comments.length === 1 ? '' : 's'}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: colors.textMuted, fontSize: 22, lineHeight: 22 }}>×</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 30 }}>
              Be the first to comment.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <Avatar uri={item.authorId?.profilePicture} name={item.authorId?.fullName} size={34} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.text, fontSize: 13 }}>
                  <Text style={{ fontWeight: '700' }}>{item.authorId?.username} </Text>
                  {item.content}
                </Text>
                <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={[styles.composer, { borderTopColor: colors.border }]}>
        <Avatar uri={user?.profilePicture} name={user?.fullName} size={32} />
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Add a comment…"
          placeholderTextColor={colors.textDim}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.bg, borderRadius: radius.pill },
          ]}
        />
        <TouchableOpacity
          onPress={send}
          disabled={!text.trim()}
          style={[
            styles.send,
            { backgroundColor: text.trim() ? colors.nexusBlue : colors.card, borderRadius: radius.pill },
          ]}
        >
          <Text style={{ color: text.trim() ? '#fff' : colors.textDim, fontWeight: '800' }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sheet: { maxHeight: '75%', paddingTop: 8 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: { flex: 1, height: 40, paddingHorizontal: 14, fontSize: 14 },
  send: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});