import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../context/ThemeContext';
import { storiesApi } from '../../api/stories.api';
import { timeAgo } from '../../utils/formatDate';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewer({ stories = [], initialIndex = 0, onClose }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState('');
  const progressTimer = useRef(null);

  const story = stories[index];
  const isVideo = story?.type === 'video' && story?.media?.url;

  const player = useVideoPlayer(
    isVideo ? { uri: story.media.url } : null,
    (p) => {
      if (p) { p.loop = false; if (isVideo) p.play(); }
    }
  );

  useEffect(() => {
    if (!story) return;
    storiesApi.view(story._id).catch(() => {});
  }, [story?._id]);

  useEffect(() => {
    if (!story || paused) return;
    setProgress(0);
    const start = Date.now();
    progressTimer.current = setInterval(() => {
      const pct = Math.min((Date.now() - start) / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(progressTimer.current);
        goNext();
      }
    }, 50);
    return () => clearInterval(progressTimer.current);
  }, [index, story, paused]);

  function goNext() {
    if (index < stories.length - 1) setIndex((i) => i + 1);
    else onClose?.();
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
    else onClose?.();
  }

  function onPressZone(e) {
    const x = e.nativeEvent.locationX;
    if (x < width / 3) goPrev();
    else goNext();
  }

  if (!story) return null;
  const author = story.authorId || {};

  return (
    <View style={styles.root}>
      {/* Background */}
      {story.type === 'image' && story.media?.url ? (
        <Image source={{ uri: story.media.url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : story.type === 'video' && story.media?.url ? (
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: story.textStyle?.background || '#2563EB' },
          ]}
        />
      )}

      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.12)' }]}
        pointerEvents="none"
      />

      {/* Tap zones */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onPressZone}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
        delayLongPress={250}
      />

      {/* Top bar */}
      <SafeAreaView edges={['top']} style={styles.topSafe} pointerEvents="box-none">
        {/* Progress bars */}
        <View style={styles.progressRow}>
          {stories.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressTrack,
                { backgroundColor: i === index ? 'transparent' : 'rgba(255,255,255,0.35)' },
              ]}
            >
              {i === index ? (
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              ) : i < index ? (
                <View style={[styles.progressFill, { width: '100%' }]} />
              ) : null}
            </View>
          ))}
        </View>

        {/* Author row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {author.profilePicture ? (
              <Image source={{ uri: author.profilePicture }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, { backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>
                  {(author.fullName || author.username || '?').slice(0, 1)}
                </Text>
              </View>
            )}
            <Text style={styles.headerName}>@{author.username || 'user'}</Text>
            <Text style={styles.headerTime}>{timeAgo(story.createdAt)}</Text>
          </View>

          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Stickers + text */}
      {story.stickers?.map((s, i) => (
        <Text key={i} style={[styles.sticker, { left: s.x, top: s.y }]}>
          {s.emoji}
        </Text>
      ))}

      {story.type === 'text' && story.text ? (
        <View style={styles.textWrap} pointerEvents="none">
          <Text style={styles.textBig}>{story.text}</Text>
        </View>
      ) : null}

      {/* Bottom reply bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe} pointerEvents="box-none">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.replyRow}>
            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder={`Reply to ${author.username || 'story'}…`}
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.replyInput}
              onSubmitEditing={() => {
                if (!reply.trim()) return;
                // Replies go as a DM — wire when ready
                setReply('');
                goNext();
              }}
            />
            <TouchableOpacity style={styles.reactBtn} onPress={() => storiesApi.react(story._id, '❤️').catch(() => {})}>
              <Text style={{ fontSize: 24 }}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactBtn} onPress={() => storiesApi.react(story._id, '🔥').catch(() => {})}>
              <Text style={{ fontSize: 24 }}>🔥</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {paused ? (
        <View style={styles.pauseBadge} pointerEvents="none">
          <ActivityIndicator color="#fff" size="small" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topSafe: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 10 },
  progressRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 34, height: 34, borderRadius: 17 },
  headerName: { color: '#fff', fontWeight: '800', fontSize: 14, marginLeft: 10 },
  headerTime: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 8 },

  sticker: { position: 'absolute', fontSize: 38 },
  textWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  textBig: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'center', lineHeight: 40 },

  bottomSafe: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  replyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyInput: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 14,
  },
  reactBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBadge: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
});