import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image,
  ActivityIndicator, Dimensions, Platform, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../context/ThemeContext';
import { uploadService } from '../../services/upload.service';
import { storiesApi } from '../../api/stories.api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Nova palette — no red/orange
const BG_COLORS = [
  '#2563EB', // Nexus blue
  '#7C3AED', // Purple
  '#06B6D4', // Cyan
  '#38BDF8', // Electric blue
  '#0EA5A4', // Teal
  '#6366F1', // Indigo
  '#080B18', // Deep navy
];

const STICKERS = ['✨', '🔥', '💙', '😂', '🎉', '🌸', '🌙', '⭐️', '💯', '🫶', '🍕', '🎬'];

export default function StoryCreator({ onDone, onCancel }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState('pick');
  const [media, setMedia] = useState(null);
  const [text, setText] = useState('');
  const [background, setBackground] = useState(BG_COLORS[0]);
  const [stickers, setStickers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [privacy, setPrivacy] = useState('everyone');
  const [toolTab, setToolTab] = useState(null);

  const videoSource = media?.type === 'video' ? { uri: media.uri } : null;
  const player = useVideoPlayer(videoSource, (p) => {
    if (p) {
      p.loop = true;
      if (media?.type === 'video') p.play();
    }
  });

  // ── Pickers ──────────────────────────────────────────────
  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission denied');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]) {
      setMedia({ uri: res.assets[0].uri, type: 'image' });
      setMode('edit');
    }
  }

  async function pickVideo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission denied');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
    });
    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      const dur = asset.duration || 0;
      if (dur > 60000) return Alert.alert('Video too long', 'Stories can be up to 60 seconds.');
      setMedia({ uri: asset.uri, type: 'video', duration: dur });
      setMode('edit');
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Camera permission denied');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!res.canceled && res.assets?.[0]) {
      setMedia({ uri: res.assets[0].uri, type: 'image' });
      setMode('edit');
    }
  }

  function addSticker(emoji) {
    setStickers((s) => [
      ...s,
      {
        id: `${emoji}-${Date.now()}`,
        emoji,
        x: SCREEN_W * 0.35 + Math.random() * 60,
        y: SCREEN_H * 0.3 + Math.random() * 100,
      },
    ]);
    setToolTab(null);
  }

  async function publish() {
    if (!media && !text.trim()) return Alert.alert('Add something first');
    setUploading(true);
    try {
      let payload;
      if (media) {
        const up = media.type === 'video'
          ? await uploadService.uploadVideo(media.uri)
          : await uploadService.uploadImage(media.uri);

        payload = {
          type: media.type,
          media: {
            url: up.url,
            publicId: up.publicId,
            mimeType: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
          },
          text: text.trim(),
          stickers: stickers.map((s) => ({ emoji: s.emoji, x: s.x, y: s.y, scale: 1 })),
          privacy,
        };
      } else {
        payload = {
          type: 'text',
          text: text.trim(),
          textStyle: { color: '#FFFFFF', background },
          stickers: stickers.map((s) => ({ emoji: s.emoji, x: s.x, y: s.y, scale: 1 })),
          privacy,
        };
      }
      await storiesApi.create(payload);
      onDone?.();
    } catch (e) {
      Alert.alert('Publish failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setUploading(false);
    }
  }

  // ═══════════════════════════════════════════════════════
  // PICK MODE
  // ═══════════════════════════════════════════════════════
  if (mode === 'pick') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onCancel} hitSlop={12}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Add to story</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <View style={styles.tilesRow}>
            <Tile
              label="Photo"
              icon="images-outline"
              color="#2563EB"
              onPress={pickImage}
            />
            <Tile
              label="Video"
              icon="videocam-outline"
              color="#7C3AED"
              onPress={pickVideo}
            />
            <Tile
              label="Camera"
              icon="camera-outline"
              color="#06B6D4"
              onPress={takePhoto}
            />
          </View>

          <TouchableOpacity
            style={[styles.textStoryCard, { borderColor: 'rgba(255,255,255,0.12)' }]}
            onPress={() => { setMedia(null); setMode('edit'); }}
            activeOpacity={0.85}
          >
            <View style={[styles.textStoryPreview, { backgroundColor: background }]}>
              <Text style={styles.textStoryAa}>Aa</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.textStoryTitle}>Text story</Text>
              <Text style={styles.textStorySub}>Share just words with a color</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>SHARE TO</Text>
          <View style={styles.privacyRow}>
            <PrivacyChip
              label="Everyone"
              icon="globe-outline"
              active={privacy === 'everyone'}
              onPress={() => setPrivacy('everyone')}
            />
            <PrivacyChip
              label="Followers"
              icon="people-outline"
              active={privacy === 'followers'}
              onPress={() => setPrivacy('followers')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════
  // EDIT MODE
  // ═══════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              setMedia(null);
              setStickers([]);
              setText('');
              setMode('pick');
            }}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Edit</Text>
          <TouchableOpacity
            onPress={() => setToolTab(toolTab === 'bg' ? null : 'bg')}
            hitSlop={12}
          >
            <Ionicons name="color-palette-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.previewWrap}>
          <View style={styles.preview}>
            {media?.type === 'image' ? (
              <Image source={{ uri: media.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : media?.type === 'video' ? (
              <VideoView
                style={StyleSheet.absoluteFill}
                player={player}
                contentFit="cover"
                nativeControls={false}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: background }]} />
            )}

            {stickers.map((s) => (
              <TouchableOpacity
                key={s.id}
                onLongPress={() => setStickers((st) => st.filter((x) => x.id !== s.id))}
                style={[styles.sticker, { left: s.x - 30, top: s.y - 30 }]}
              >
                <Text style={{ fontSize: 40 }}>{s.emoji}</Text>
              </TouchableOpacity>
            ))}

            {text ? (
              <View style={styles.textOverlay} pointerEvents="none">
                <Text style={styles.textOverlayTxt}>{text}</Text>
              </View>
            ) : null}

            {toolTab === 'text' ? (
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type your story…"
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline
                autoFocus
                style={styles.textInputOverlay}
              />
            ) : null}
          </View>
        </View>

        {!media && toolTab === 'bg' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bgRow}
          >
            {BG_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => { setBackground(c); setToolTab(null); }}
                style={[
                  styles.bgSwatch,
                  {
                    backgroundColor: c,
                    borderWidth: background === c ? 3 : 1,
                    borderColor: background === c ? '#fff' : 'rgba(255,255,255,0.3)',
                  },
                ]}
              />
            ))}
          </ScrollView>
        ) : null}

        {toolTab === 'sticker' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickerRow}
          >
            {STICKERS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => addSticker(e)}
                style={styles.stickerBtn}
              >
                <Text style={{ fontSize: 28 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.toolbar}>
          <ToolButton
            icon="text-outline"
            label="Text"
            active={toolTab === 'text'}
            onPress={() => setToolTab(toolTab === 'text' ? null : 'text')}
          />
          <ToolButton
            icon="happy-outline"
            label="Sticker"
            active={toolTab === 'sticker'}
            onPress={() => setToolTab(toolTab === 'sticker' ? null : 'sticker')}
          />
          <ToolButton
            icon="color-palette-outline"
            label="Color"
            active={toolTab === 'bg'}
            onPress={() => setToolTab(toolTab === 'bg' ? null : 'bg')}
            disabled={!!media}
          />
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={publish}
            disabled={uploading}
            style={[styles.publishBtn, { opacity: uploading ? 0.7 : 1 }]}
            activeOpacity={0.85}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishTxt}>Share to story</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────
function Tile({ label, icon, color, onPress }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.tileInner, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function PrivacyChip({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.privacyChip,
        {
          backgroundColor: active ? '#2563EB' : 'rgba(255,255,255,0.08)',
          borderColor: active ? '#2563EB' : 'rgba(255,255,255,0.15)',
        },
      ]}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={16} color="#fff" />
      <Text style={styles.privacyTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

function ToolButton({ icon, label, active, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.toolBtn}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.toolIcon,
          {
            backgroundColor: active ? '#2563EB' : 'rgba(255,255,255,0.10)',
            opacity: disabled ? 0.35 : 1,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={[styles.toolLabel, { opacity: disabled ? 0.4 : 1 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    includeFontPadding: false,
  },

  // Pick mode
  tilesRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  tile: { flex: 1, alignItems: 'center' },
  tileInner: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    includeFontPadding: false,
  },
  textStoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 22,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  textStoryPreview: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStoryAa: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    includeFontPadding: false,
  },
  textStoryTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    includeFontPadding: false,
  },
  textStorySub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 10,
    marginHorizontal: 16,
    includeFontPadding: false,
  },
  privacyRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16 },
  privacyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  privacyTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    includeFontPadding: false,
  },

  // Edit mode
  previewWrap: { flex: 1, paddingHorizontal: 12, paddingVertical: 4 },
  preview: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  sticker: { position: 'absolute' },
  textOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: '40%',
    alignItems: 'center',
  },
  textOverlayTxt: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 38,
    includeFontPadding: false,
  },
  textInputOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: '40%',
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },

  bgRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  bgSwatch: { width: 40, height: 40, borderRadius: 20 },

  stickerRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  stickerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toolBtn: { alignItems: 'center' },
  toolIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '700',
    includeFontPadding: false,
  },

  bottomBar: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: 4 },
  publishBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});