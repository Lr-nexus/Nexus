import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { pickVideo } from '../../utils/media';
import { uploadService } from '../../services/upload.service';
import { vibesApi } from '../../api/vibes.api';
import Header from '../../components/common/Header';

export default function CreateVibeScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [asset, setAsset] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  async function choose() {
    try {
      const a = await pickVideo();
      if (a) setAsset(a);
    } catch (e) { Alert.alert('Could not pick video', e.message); }
  }

  function hashtags(text) {
    const m = text.match(/#(\w+)/g) || [];
    return m.map((h) => h.slice(1).toLowerCase());
  }

  async function publish() {
    if (!asset) return Alert.alert('Pick a video first');
    setBusy(true);
    try {
      const up = await uploadService.uploadVideo(asset.uri);
      await vibesApi.create({
        videoUrl: up.url,
        publicId: up.publicId,
        thumbnail: up.thumbnail || '',
        caption: caption.trim(),
        hashtags: hashtags(caption),
        durationSeconds: asset.duration ? Math.round(asset.duration / 1000) : 0,
        visibility: 'public',
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Try again.');
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="New Vibe"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {asset ? (
          <View style={[styles.preview, { backgroundColor: '#000', borderRadius: radius.lg }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              🎬 Video selected ({Math.round((asset.duration || 0) / 1000)}s)
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={choose}
            style={[
              styles.empty,
              { borderColor: colors.border, borderRadius: radius.lg },
            ]}
          >
            <Text style={{ fontSize: 52 }}>🎬</Text>
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>
              Pick a short vertical video
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 4 }}>
              Up to 50MB · mp4, mov
            </Text>
          </TouchableOpacity>
        )}

        {asset ? (
          <TouchableOpacity onPress={choose} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Choose a different video</Text>
          </TouchableOpacity>
        ) : null}

        <TextInput
          placeholder="Write a caption… #vibe #trending"
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

        <TouchableOpacity
          onPress={publish}
          disabled={busy || !asset}
          style={[
            styles.btn,
            { backgroundColor: asset ? colors.nexusBlue : colors.card, borderRadius: radius.md },
          ]}
        >
          {busy ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: asset ? '#fff' : colors.textDim, fontWeight: '800' }}>
              Publish Vibe 🔥
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  empty: {
    height: 340, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  preview: {
    height: 340, alignItems: 'center', justifyContent: 'center',
  },
  caption: {
    marginTop: 16, minHeight: 90, padding: 14, fontSize: 15,
    borderWidth: 1, textAlignVertical: 'top',
  },
  btn: {
    marginTop: 20, height: 52, alignItems: 'center', justifyContent: 'center',
  },
});