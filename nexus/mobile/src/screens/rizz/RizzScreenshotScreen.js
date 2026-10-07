import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { pickImage } from '../../utils/media';
import { uploadService } from '../../services/upload.service';
import { rizzApi } from '../../api/rizz.api';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import RizzResponseCard from '../../components/rizz/RizzResponseCard';

export default function RizzScreenshotScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [asset, setAsset] = useState(null);
  const [responses, setResponses] = useState([]);
  const [busy, setBusy] = useState(false);

  async function choose() {
    try {
      const a = await pickImage({ allowsEditing: false, quality: 0.8 });
      if (a) setAsset(a);
    } catch (e) { Alert.alert('Could not pick screenshot', e.message); }
  }

  async function analyze() {
    if (!asset) return Alert.alert('Pick a screenshot first');
    setBusy(true);
    setResponses([]);
    try {
      const up = await uploadService.uploadImage(asset.uri);
      const res = await rizzApi.reply({
        message: `Analyze this conversation screenshot and suggest 3 replies. URL: ${up.url}`,
        style: 'smooth',
        context: 'screenshot analyzer',
      });
      setResponses(res.responses || []);
    } catch (e) {
      Alert.alert(
        'Rizz AI',
        e?.response?.data?.message || '🔥 Rizz AI is temporarily unavailable. Try again in a moment.'
      );
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Analyze screenshot"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {asset ? (
          <Image
            source={{ uri: asset.uri }}
            style={{ width: '100%', height: 340, borderRadius: radius.md, marginBottom: 14 }}
            resizeMode="contain"
          />
        ) : (
          <TouchableOpacity
            onPress={choose}
            style={[styles.empty, { borderColor: colors.border, borderRadius: radius.lg }]}
          >
            <Text style={{ fontSize: 46 }}>🖼️</Text>
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>
              Pick a screenshot of a conversation
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
              We won't store it unless you ask us to.
            </Text>
          </TouchableOpacity>
        )}

        <Button
          title={asset ? 'Analyze with Rizz 🔥' : 'Pick screenshot'}
          onPress={asset ? analyze : choose}
          loading={busy}
        />

        {asset ? (
          <TouchableOpacity onPress={choose} style={{ marginTop: 10, alignSelf: 'center' }}>
            <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Choose different image</Text>
          </TouchableOpacity>
        ) : null}

        {responses.length ? (
          <>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.6,
                marginTop: 22,
                marginBottom: 8,
              }}
            >
              SUGGESTED REPLIES
            </Text>
            {responses.map((r, i) => (
              <RizzResponseCard key={i} index={i} text={r} style="smooth" />
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  empty: {
    height: 320, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
});