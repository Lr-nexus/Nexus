import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { pickImage, pickMultipleImages } from '../../utils/media';
import { uploadService } from '../../services/upload.service';
import { postsApi } from '../../api/posts.api';
import { useAuth } from '../../context/AuthContext';

const VISIBILITY = [
  { key: 'public', label: 'Everyone' },
  { key: 'followers', label: 'Followers' },
  { key: 'close', label: 'Close friends' },
  { key: 'private', label: 'Only me' },
];

export default function CreatePostScreen({ navigation }) {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [uploading, setUploading] = useState(false);

  function extractHashtags(text) {
    const found = text.match(/#(\w+)/g) || [];
    return found.map((h) => h.slice(1).toLowerCase());
  }

  async function pickOne() {
    const a = await pickImage({ allowsEditing: true, quality: 0.85 });
    if (a) setAssets([a]);
  }

  async function pickMany() {
    const list = await pickMultipleImages({ selectionLimit: 10 });
    if (list.length) setAssets(list);
  }

  async function publish() {
    if (!assets.length && !caption.trim()) {
      return Alert.alert('Add a photo or write something');
    }
    setUploading(true);
    try {
      const media = [];
      for (const a of assets) {
        const up = await uploadService.uploadImage(a.uri);
        media.push({ url: up.url, publicId: up.publicId, mimeType: 'image/jpeg' });
      }
      const type = media.length === 0 ? 'text' : media.length === 1 ? 'image' : 'carousel';

      await postsApi.create({
        type,
        caption: caption.trim(),
        media,
        location: location.trim(),
        visibility,
        hashtags: extractHashtags(caption),
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Post failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={uploading}>
            <Text style={{ color: colors.text, fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>New Post</Text>
          <TouchableOpacity onPress={publish} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color={colors.electricBlue} />
            ) : (
              <Text style={{ color: colors.electricBlue, fontWeight: '800', fontSize: 15 }}>
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
          {assets.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {assets.map((a, i) => (
                  <Image
                    key={i}
                    source={{ uri: a.uri }}
                    style={{ width: 120, height: 120, borderRadius: 12 }}
                  />
                ))}
                <TouchableOpacity
                  onPress={pickMany}
                  style={[styles.addMore, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 22 }}>＋</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={[styles.empty, { borderColor: colors.border, borderRadius: radius.lg }]}>
              <Text style={{ fontSize: 44 }}>📸</Text>
              <Text style={{ color: colors.textMuted, marginTop: 10 }}>
                Add photos to your post
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.pickBtn, { backgroundColor: colors.nexusBlue }]}
                  onPress={pickOne}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Pick one</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickBtn, { backgroundColor: colors.card }]}
                  onPress={pickMany}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>Pick many</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TextInput
            placeholder="Write a caption… use #hashtags and @mentions"
            placeholderTextColor={colors.textDim}
            value={caption}
            onChangeText={setCaption}
            multiline
            style={[
              styles.caption,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          />

          <TextInput
            placeholder="📍 Add location (optional)"
            placeholderTextColor={colors.textDim}
            value={location}
            onChangeText={setLocation}
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
            ]}
          />

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Who can see this?</Text>
          <View style={styles.chipRow}>
            {VISIBILITY.map((v) => (
              <TouchableOpacity
                key={v.key}
                onPress={() => setVisibility(v.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: visibility === v.key ? colors.nexusBlue : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: visibility === v.key ? '#fff' : colors.text,
                    fontWeight: '600',
                  }}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 20 }}>
            Posting as @{user?.username}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 16, fontWeight: '700' },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  addMore: {
    width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  caption: {
    marginTop: 16,
    minHeight: 100,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  input: {
    marginTop: 12,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginTop: 20, marginBottom: 8, letterSpacing: 0.4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
});