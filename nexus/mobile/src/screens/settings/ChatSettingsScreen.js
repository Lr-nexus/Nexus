import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import ToggleRow from './_ToggleRow';

export default function ChatSettingsScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [s, setS] = React.useState({
    enterToSend: true,
    mediaAutoDownload: true,
    mediaWifiOnly: false,
    messagePreviews: true,
    saveMediaToGallery: false,
  });
  const toggle = (k) => (v) => setS((prev) => ({ ...prev, [k]: v }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Chat"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <ToggleRow label="Enter to send" value={s.enterToSend} onChange={toggle('enterToSend')} />
        <ToggleRow label="Auto-download media" value={s.mediaAutoDownload} onChange={toggle('mediaAutoDownload')} />
        <ToggleRow label="Wi-Fi only for media" value={s.mediaWifiOnly} onChange={toggle('mediaWifiOnly')} />
        <ToggleRow label="Show message previews" value={s.messagePreviews} onChange={toggle('messagePreviews')} />
        <ToggleRow label="Save media to gallery" value={s.saveMediaToGallery} onChange={toggle('saveMediaToGallery')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });