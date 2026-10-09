import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatTime } from '../../utils/formatDate';

export default function ChatBubble({ message, mine, onLongPress }) {
  const { colors, radius, spacing } = useTheme();
  const isDeleted = message.isDeleted;

  const bubbleBg = mine ? colors.bubbleMine : colors.bubbleTheirs;
  const textColor = mine ? colors.bubbleMineText : colors.bubbleTheirsText;

  function renderStatus() {
    if (!mine) return null;
    const tick = message.readBy?.length
      ? '✓✓'
      : message.deliveredTo?.length
      ? '✓✓'
      : message._id && !message.__optimistic
      ? '✓'
      : '⏱';
    return (
      <Text style={[styles.status, { color: 'rgba(255,255,255,0.85)' }]}>
        {tick}
      </Text>
    );
  }

  if (isDeleted) {
    return (
      <View style={[styles.row, mine ? styles.mineRow : styles.theirsRow]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleBg,
              borderRadius: radius.xl,
              paddingHorizontal: spacing.md,
              paddingVertical: 8,
            },
          ]}
        >
          <Text style={{ color: textColor, fontStyle: 'italic', opacity: 0.7 }}>
            Message deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, mine ? styles.mineRow : styles.theirsRow]}>
      <TouchableOpacity
        onLongPress={() => onLongPress?.(message)}
        delayLongPress={280}
        activeOpacity={0.9}
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderRadius: radius.xl,
            borderTopLeftRadius: mine ? radius.xl : 6,
            borderTopRightRadius: mine ? 6 : radius.xl,
          },
        ]}
      >
        {message.replyTo ? (
          <View
            style={{
              borderLeftWidth: 3,
              borderLeftColor: mine ? '#ffffff70' : colors.teal,
              paddingLeft: 8,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: textColor, opacity: 0.85, fontSize: 12 }} numberOfLines={2}>
              ↩ Reply
            </Text>
          </View>
        ) : null}

        {message.type === 'image' && message.media?.url ? (
          <Image
            source={{ uri: message.media.url }}
            style={{ width: 220, height: 220, borderRadius: radius.md, marginBottom: 6 }}
            resizeMode="cover"
          />
        ) : null}

        {message.type === 'video' && message.media?.url ? (
          <View
            style={{
              width: 220, height: 220, borderRadius: radius.md,
              backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 36 }}>▶️</Text>
          </View>
        ) : null}

        {message.type === 'audio' && message.media?.url ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 }}>
            <Text style={{ fontSize: 22 }}>🎙️</Text>
            <View style={{ height: 4, flex: 1, backgroundColor: mine ? 'rgba(255,255,255,0.35)' : colors.border, borderRadius: 2 }} />
            <Text style={{ color: textColor, fontSize: 12 }}>0:12</Text>
          </View>
        ) : null}

        {message.type === 'file' && message.media?.url ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
            <Text style={{ fontSize: 24 }}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: textColor, fontWeight: '700', fontSize: 13 }}>
                {message.media?.name || 'Document'}
              </Text>
              <Text style={{ color: textColor, opacity: 0.7, fontSize: 11 }}>Tap to open</Text>
            </View>
          </View>
        ) : null}

        {message.type === 'location' ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ fontSize: 22 }}>📍</Text>
            <Text style={{ color: textColor, fontWeight: '600', fontSize: 13 }}>Shared location</Text>
          </View>
        ) : null}

        {message.content ? (
          <Text style={{ color: textColor, fontSize: 15, lineHeight: 21 }}>
            {message.content}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {message.editedAt ? (
            <Text style={{ color: textColor, fontSize: 10, opacity: 0.7, marginRight: 4 }}>
              edited
            </Text>
          ) : null}
          <Text style={{ color: textColor, fontSize: 10, opacity: 0.7 }}>
            {formatTime(message.createdAt)}
          </Text>
          {renderStatus()}
        </View>

        {message.reactions?.length ? (
          <View style={styles.reactionsRow}>
            {message.reactions.slice(0, 3).map((r, i) => (
              <Text key={i} style={{ fontSize: 14 }}>{r.emoji}</Text>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 10, marginVertical: 2 },
  mineRow: { alignItems: 'flex-end' },
  theirsRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 9 },
  metaRow: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
    marginTop: 4, gap: 2,
  },
  status: { fontSize: 10, marginLeft: 2 },
  reactionsRow: {
    flexDirection: 'row', gap: 2, position: 'absolute',
    bottom: -12, right: 12, backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12, paddingHorizontal: 6, paddingVertical: 1,
  },
});