import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { vibesApi } from '../../api/vibes.api';

const { width, height } = Dimensions.get('window');

export default function VibePlayer({ vibe, isActive = true, onLike, onOpenComments }) {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(!!vibe.likedByMe);
  const [likesCount, setLikesCount] = useState(vibe.likesCount || 0);
  const viewSentRef = useRef(false);

  const videoSource = vibe.videoUrl ? { uri: vibe.videoUrl } : null;
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (!player) return;
    if (isActive) {
      player.play();
      if (!viewSentRef.current) {
        viewSentRef.current = true;
        vibesApi.view(vibe._id, 0).catch(() => {});
      }
    } else {
      player.pause();
    }
  }, [isActive, player, vibe._id]);

  async function toggleLike() {
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await vibesApi.like(vibe._id);
      setLiked(res.liked);
      setLikesCount(res.likesCount);
      onLike?.(vibe._id, res);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  }

  const author = vibe.authorId || {};

  return (
    <View style={[styles.root, { width, height }]}>
      {videoSource ? (
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      ) : vibe.thumbnail ? (
        <Image source={{ uri: vibe.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : null}

      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.12)' }]} pointerEvents="none" />

      {!player && videoSource ? (
        <ActivityIndicator color="#fff" style={{ position: 'absolute', top: '50%', alignSelf: 'center' }} />
      ) : null}

      <View style={styles.rightRail}>
        <TouchableOpacity onPress={toggleLike} style={styles.railBtn}>
          <Text style={{ fontSize: 30 }}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={styles.railText}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenComments} style={styles.railBtn}>
          <Text style={{ fontSize: 28 }}>💬</Text>
          <Text style={styles.railText}>{vibe.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.railBtn}>
          <Text style={{ fontSize: 28 }}>↗️</Text>
          <Text style={styles.railText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.railBtn}>
          <Text style={{ fontSize: 28 }}>📑</Text>
          <Text style={styles.railText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Avatar uri={author.profilePicture} name={author.fullName} size={38} ring ringColor="#fff" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.name}>@{author.username || 'user'}</Text>
            <Text style={styles.subname}>{author.fullName}</Text>
          </View>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followTxt}>Follow</Text>
          </TouchableOpacity>
        </View>

        {vibe.caption ? <Text style={styles.caption}>{vibe.caption}</Text> : null}

        {vibe.hashtags?.length ? (
          <Text style={styles.hashtags}>{vibe.hashtags.map((h) => `#${h}`).join(' ')}</Text>
        ) : null}

        {vibe.music?.title ? (
          <View style={styles.musicRow}>
            <Text style={{ fontSize: 14 }}>🎵</Text>
            <Text style={styles.musicText} numberOfLines={1}>
              {vibe.music.title} — {vibe.music.artist || 'Unknown'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#000' },
  rightRail: {
    position: 'absolute',
    right: 12,
    bottom: 140,
    alignItems: 'center',
    gap: 18,
  },
  railBtn: { alignItems: 'center' },
  railText: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2 },
  bottom: {
    position: 'absolute',
    left: 16,
    right: 80,
    bottom: 30,
  },
  name: { color: '#fff', fontWeight: '800', fontSize: 15 },
  subname: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  caption: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 6 },
  hashtags: { color: '#8EC5FF', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  musicText: { color: '#fff', fontSize: 12, flex: 1 },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  followTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
});