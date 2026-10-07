import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import ToggleRow from './_ToggleRow';

export default function NotificationSettingsScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [s, setS] = React.useState({
    messages: true,
    calls: true,
    likes: true,
    comments: true,
    followers: true,
    stories: true,
    groups: true,
    channels: true,
    rizz: false,
  });
  const toggle = (k) => (v) => setS((prev) => ({ ...prev, [k]: v }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Notifications"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <ToggleRow label="Messages" value={s.messages} onChange={toggle('messages')} />
        <ToggleRow label="Calls" value={s.calls} onChange={toggle('calls')} />
        <ToggleRow label="Likes" value={s.likes} onChange={toggle('likes')} />
        <ToggleRow label="Comments" value={s.comments} onChange={toggle('comments')} />
        <ToggleRow label="New followers" value={s.followers} onChange={toggle('followers')} />
        <ToggleRow label="Stories" value={s.stories} onChange={toggle('stories')} />
        <ToggleRow label="Group activity" value={s.groups} onChange={toggle('groups')} />
        <ToggleRow label="Channels" value={s.channels} onChange={toggle('channels')} />
        <ToggleRow label="Rizz AI updates" value={s.rizz} onChange={toggle('rizz')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });