import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import { storiesApi } from '../../api/stories.api';
import { timeAgo } from '../../utils/formatDate';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewer({ stories = [], initialIndex = 0, onClose }) {
  const { colors, spacing } = useTheme();
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressTimer = useRef(null);
  const story = stories[index];

  useEffect(() => {
    if (!story) return;
    storiesApi.view(story._id).catch(() => {});
  }, [story]);

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

  function onLongPressStart() {
    setPaused(true);
  }

  function onLongPressEnd() {
    setPaused(false);
  }

  if (!story) return null;
  const author = story.authorId || {};
  const media = story.media?.url;

  return (
    <View style={styles.root}>
      {/* background */}
      {story.type === 'image' || story.type === 'video' ? (
        <Image source={{ uri: media }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: story.textStyle?.background || '#2563EB' }]} />
      )}

      {/* dark overlay for readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.15)' }]} pointerEvents="none" />

      {/* tap zones */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onPressZone}
        onLongPress={onLongPressStart}
        onPressOut={onLongPressEnd}
        delayLongPress={250}
      />

      {/* top bar */}
      <SafeAreaView edges={['top']} style={styles.topSafe} pointerEvents="box-none">
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

        <View style={styles.headerRow}>
          <Avatar uri={author.profilePicture} name={author.fullName} size={36} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.name}>{author.fullName || author.username}</Text>
            <Text style={styles.time}>{timeAgo(story.createdAt)}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ color: '#fff', fontSize: 26, lineHeight: 26 }}>×</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* text story */}
      {story.type === 'text' ? (
        <View style={styles.textWrap} pointerEvents="none">
          <Text style={styles.textBig}>{story.text}</Text>
        </View>
      ) : null}

      {/* footer input */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe} pointerEvents="box-none">
        <View style={styles.replyRow}>
          <View style={styles.replyInput}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              Reply to {author.username || 'story'}…
            </Text>
          </View>
          <TouchableOpacity style={styles.reactBtn}>
            <Text style={{ fontSize: 22 }}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactBtn}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
          </TouchableOpacity>
        </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  name: { color: '#fff', fontWeight: '700', fontSize: 14 },
  time: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  textWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  textBig: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 38 },
  bottomSafe: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  replyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyInput: {
    flex: 1, height: 44, borderRadius: 22, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', paddingHorizontal: 16,
  },
  reactBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  pauseBadge: {
    position: 'absolute', top: 80, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20,
  },
});