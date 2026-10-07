import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { pickImage } from '../../utils/media';
import { uploadService } from '../../services/upload.service';
import { storiesApi } from '../../api/stories.api';

const BG_COLORS = ['#2563EB', '#7C3AED', '#06B6D4', '#EF4444', '#F59E0B', '#10B981', '#111827'];
const EMOJIS = ['✨', '🔥', '💙', '😂', '🎉', '🌸', '🌙', '⭐️', '🍕', '💯'];

export default function StoryCreator({ onDone, onCancel }) {
  const { colors, spacing, radius } = useTheme();
  const [mode, setMode] = useState('text'); // text | media
  const [text, setText] = useState('');
  const [background, setBackground] = useState(BG_COLORS[0]);
  const [stickers, setStickers] = useState([]);
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [privacy, setPrivacy] = useState('everyone');

  async function chooseMedia() {
    try {
      const asset = await pickImage({ allowsEditing: true, quality: 0.85 });
      if (asset) {
        setMedia(asset);
        setMode('media');
      }
    } catch (e) {
      Alert.alert('Could not pick image', e.message);
    }
  }

  function addSticker(emoji) {
    setStickers((s) => [
      ...s,
      { emoji, x: 40 + Math.random() * 220, y: 120 + Math.random() * 320, scale: 1 },
    ]);
  }

  async function publish() {
    if (mode === 'text' && !text.trim()) {
      return Alert.alert('Add some text first');
    }
    if (mode === 'media' && !media) {
      return Alert.alert('Pick a photo first');
    }

    setUploading(true);
    try {
      let payload;
      if (mode === 'text') {
        payload = {
          type: 'text',
          text: text.trim(),
          textStyle: { color: '#FFFFFF', background },
          stickers,
          privacy,
        };
      } else {
        const uploaded = await uploadService.uploadImage(media.uri);
        payload = {
          type: 'image',
          media: { url: uploaded.url, publicId: uploaded.publicId, mimeType: 'image/jpeg' },
          text: text.trim(),
          stickers,
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

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Preview area */}
      <View
        style={[
          styles.preview,
          {
            backgroundColor: mode === 'media' ? '#000' : background,
            borderRadius: radius.lg,
          },
        ]}
      >
        {mode === 'media' && media ? (
          <Image source={{ uri: media.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}

        {stickers.map((s, i) => (
          <Text
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              fontSize: 34,
            }}
          >
            {s.emoji}
          </Text>
        ))}

        {mode === 'text' ? (
          <TextInput
            placeholder="Type your story…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={text}
            onChangeText={setText}
            multiline
            style={styles.previewText}
          />
        ) : (
          <TextInput
            placeholder="Add a caption (optional)…"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={text}
            onChangeText={setText}
            style={styles.mediaCaption}
          />
        )}
      </View>

      {/* Controls */}
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={styles.rowGap}>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={chooseMedia}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>📷 Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: mode === 'text' ? colors.nexusBlue : colors.card, borderColor: colors.border }]}
            onPress={() => setMode('text')}
          >
            <Text style={{ color: mode === 'text' ? '#fff' : colors.text, fontWeight: '700' }}>✏️ Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setPrivacy(privacy === 'everyone' ? 'followers' : 'everyone')}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {privacy === 'everyone' ? '🌍 Everyone' : '👥 Followers'}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'text' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rowGap}>
              {BG_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setBackground(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: background === c ? 3 : 1,
                    borderColor: background === c ? colors.text : colors.border,
                  }}
                />
              ))}
            </View>
          </ScrollView>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowGap}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => addSticker(e)}
                style={[styles.emojiBtn, { backgroundColor: colors.card }]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.rowGap}>
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.actionBtn, { backgroundColor: colors.card, flex: 1 }]}
            disabled={uploading}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={publish}
            style={[styles.actionBtn, { backgroundColor: colors.nexusBlue, flex: 2 }]}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800' }}>Publish story</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  preview: { flex: 1, margin: 12, overflow: 'hidden', position: 'relative' },
  previewText: {
    flex: 1,
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 24,
  },
  mediaCaption: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 12,
  },
  rowGap: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  emojiBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});