import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PostActions({
  liked,
  likesCount,
  commentsCount,
  saved,
  onLike,
  onComment,
  onShare,
  onSave,
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.row, { paddingTop: spacing.md }]}>
      <TouchableOpacity style={styles.btn} onPress={onLike} activeOpacity={0.7}>
        <Text style={{ fontSize: 22 }}>{liked ? '❤️' : '🤍'}</Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>{likesCount || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onComment} activeOpacity={0.7}>
        <Text style={{ fontSize: 20 }}>💬</Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>{commentsCount || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onShare} activeOpacity={0.7}>
        <Text style={{ fontSize: 20 }}>↗️</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.btn} onPress={onSave} activeOpacity={0.7}>
        <Text style={{ fontSize: 20 }}>{saved ? '🔖' : '📑'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: { paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { fontSize: 13, fontWeight: '600' },
});