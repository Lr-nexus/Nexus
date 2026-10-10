import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '../../context/ThemeContext';
import { formatTime } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatFileSize';

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
    return <Text style={[styles.status, { color: 'rgba(255,255,255,0.85)' }]}>{tick}</Text>;
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
        {/* Image */}
        {message.type === 'image' && message.media?.url ? (
          <Image
            source={{ uri: message.media.url }}
            style={{ width: 220, height: 220, borderRadius: radius.md, marginBottom: 6 }}
            resizeMode="cover"
          />
        ) : null}

        {/* Video */}
        {message.type === 'video' && message.media?.url ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(message.media.url).catch(() => {})}
            style={styles.mediaBox}
            activeOpacity={0.85}
          >
            <Ionicons name="play-circle" size={54} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        ) : null}

        {/* Voice / audio */}
        {message.type === 'audio' && message.media?.url ? (
          <VoicePlayer uri={message.media.url} mine={mine} textColor={textColor} />
        ) : null}

        {/* Document */}
        {message.type === 'file' && message.media?.url ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(message.media.url).catch(() => {})}
            style={styles.fileRow}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.fileIcon,
                { backgroundColor: mine ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)' },
              ]}
            >
              <Ionicons name="document-text" size={22} color={textColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{ color: textColor, fontWeight: '700', fontSize: 13 }}
              >
                {message.media?.name || 'Document'}
              </Text>
              <Text style={{ color: textColor, opacity: 0.7, fontSize: 11, marginTop: 2 }}>
                Tap to open
              </Text>
            </View>
            <Ionicons
              name="download-outline"
              size={20}
              color={textColor}
              style={{ opacity: 0.75 }}
            />
          </TouchableOpacity>
        ) : null}

        {/* Location */}
        {message.type === 'location' && message.media?.url ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(message.media.url).catch(() => {})}
            style={[
              styles.locCard,
              { borderColor: mine ? 'rgba(255,255,255,0.35)' : colors.border },
            ]}
            activeOpacity={0.85}
          >
            <View style={styles.locMap}>
              <Ionicons name="location" size={34} color={colors.nexusBlue} />
            </View>
            <View style={{ padding: 10 }}>
              <Text
                numberOfLines={2}
                style={{ color: textColor, fontWeight: '700', fontSize: 13 }}
              >
                {message.media?.name || message.content || 'Shared location'}
              </Text>
              <Text style={{ color: textColor, opacity: 0.7, fontSize: 11, marginTop: 2 }}>
                Open in Maps
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Contact */}
        {message.type === 'contact' ? (
          <View
            style={[
              styles.contactRow,
              { borderColor: mine ? 'rgba(255,255,255,0.35)' : colors.border },
            ]}
          >
            {message.media?.url ? (
              <Image source={{ uri: message.media.url }} style={styles.contactAvatar} />
            ) : (
              <View
                style={[
                  styles.contactAvatar,
                  {
                    backgroundColor: colors.purple,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Ionicons name="person" size={22} color="#fff" />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: textColor, fontWeight: '700', fontSize: 13 }}>
                {message.media?.name || message.content || 'Nova contact'}
              </Text>
              <Text style={{ color: textColor, opacity: 0.7, fontSize: 11, marginTop: 2 }}>
                @{message.content || 'user'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Call bubble */}
        {message.type === 'call' ? (
          <View style={styles.callRow}>
            <Ionicons
              name={
                message.content === 'missed'
                  ? 'call-outline'
                  : message.content === 'incoming'
                  ? 'call'
                  : 'arrow-forward-circle-outline'
              }
              size={20}
              color={message.content === 'missed' ? colors.danger : textColor}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={{
                  color: message.content === 'missed' ? colors.danger : textColor,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {message.content === 'missed'
                  ? 'Missed call'
                  : message.content === 'incoming'
                  ? 'Incoming call'
                  : 'Outgoing call'}
              </Text>
              <Text style={{ color: textColor, opacity: 0.75, fontSize: 11, marginTop: 2 }}>
                {message.media?.name === 'video-call' ? 'Video call' : 'Voice call'}
                {message.media?.size > 0
                  ? ` · ${formatDuration(message.media.size)}`
                  : ''}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Text content (skipped for special bubble types) */}
        {message.content &&
        message.type !== 'contact' &&
        message.type !== 'location' &&
        message.type !== 'call' ? (
          <Text style={{ color: textColor, fontSize: 15, lineHeight: 21 }}>
            {message.content}
          </Text>
        ) : null}

        {/* Meta row */}
        <View style={styles.metaRow}>
          {message.editedAt ? (
            <Text
              style={{ color: textColor, fontSize: 10, opacity: 0.7, marginRight: 4 }}
            >
              edited
            </Text>
          ) : null}
          <Text style={{ color: textColor, fontSize: 10, opacity: 0.7 }}>
            {formatTime(message.createdAt)}
          </Text>
          {renderStatus()}
        </View>

        {/* Reactions */}
        {message.reactions?.length ? (
          <View style={styles.reactionsRow}>
            {message.reactions.slice(0, 3).map((r, i) => (
              <Text key={i} style={{ fontSize: 14 }}>
                {r.emoji}
              </Text>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
   Voice player — uses expo-audio hooks
   ────────────────────────────────────────────────────────── */
function VoicePlayer({ uri, mine, textColor }) {
  const { colors } = useTheme();
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const isPlaying = status?.playing || false;
  const rawPosition = status?.currentTime || 0;
  const rawDuration = status?.duration || 0;

  // Some platforms report duration in ms — normalize to seconds
  const duration = rawDuration > 1000 ? rawDuration / 1000 : rawDuration;
  const position = rawPosition > duration * 1.1 ? rawPosition / 1000 : rawPosition;

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  function toggle() {
    if (isPlaying) {
      player.pause();
    } else {
      if (duration > 0 && position >= duration - 0.1) player.seekTo(0);
      player.play();
    }
  }

  return (
    <View style={voiceStyles.row}>
      <TouchableOpacity onPress={toggle} style={voiceStyles.playBtn} activeOpacity={0.8}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={textColor} />
      </TouchableOpacity>

      <View style={voiceStyles.waveWrap}>
        <View
          style={[
            voiceStyles.waveBase,
            { backgroundColor: mine ? 'rgba(255,255,255,0.3)' : colors.border },
          ]}
        >
          <View
            style={[
              voiceStyles.waveFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: mine ? '#fff' : colors.teal,
              },
            ]}
          />
        </View>
        <View style={voiceStyles.timeRow}>
          <Text style={{ color: textColor, fontSize: 10, opacity: 0.8 }}>
            {formatDuration(Math.floor(position))}
          </Text>
          <Text style={{ color: textColor, fontSize: 10, opacity: 0.6 }}>
            {formatDuration(Math.floor(duration))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const voiceStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    paddingVertical: 4,
    gap: 10,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveWrap: { flex: 1 },
  waveBase: { height: 4, borderRadius: 2, overflow: 'hidden' },
  waveFill: { height: '100%' },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

const styles = StyleSheet.create({
  row: { paddingHorizontal: 10, marginVertical: 2 },
  mineRow: { alignItems: 'flex-end' },
  theirsRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 9 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  status: { fontSize: 10, marginLeft: 2 },
  reactionsRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: -12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  mediaBox: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    minWidth: 200,
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locCard: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  locMap: {
    height: 110,
    backgroundColor: 'rgba(37,99,235,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 200,
    marginBottom: 4,
  },
  contactAvatar: { width: 42, height: 42, borderRadius: 21 },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
    paddingVertical: 4,
  },
});