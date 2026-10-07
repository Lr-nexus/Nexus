import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { timeAgo } from '../../utils/formatDate';

export default function PostComment({ comment, onReply, onLike }) {
  const { colors, spacing } = useTheme();
  const author = comment.authorId || {};

  return (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      <Avatar uri={author.profilePicture} name={author.fullName} size={34} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>
          <Text style={{ fontWeight: '700' }}>{author.username} </Text>
          {comment.content}
        </Text>
        <View style={styles.metaRow}>
          <Text style={{ color: colors.textDim, fontSize: 11 }}>
            {timeAgo(comment.createdAt)}
          </Text>
          <TouchableOpacity onPress={onLike} style={{ marginLeft: 14 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
              {(comment.likes?.length || 0) > 0 ? `❤️ ${comment.likes.length}` : 'Like'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onReply} style={{ marginLeft: 14 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  metaRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
});