import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import ToggleRow from './_ToggleRow';

export default function PrivacySettingsScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [state, setState] = React.useState({
    privateAccount: false,
    readReceipts: true,
    lastSeen: true,
    onlineStatus: true,
    messagesFrom: 'everyone',
    callsFrom: 'contacts',
    storyAudience: 'followers',
    commentsFrom: 'everyone',
  });
  const toggle = (k) => (v) => setState((s) => ({ ...s, [k]: v }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Privacy"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <SectionTitle>Account</SectionTitle>
        <ToggleRow label="Private account" value={state.privateAccount} onChange={toggle('privateAccount')} />

        <SectionTitle>Activity</SectionTitle>
        <ToggleRow label="Show read receipts" value={state.readReceipts} onChange={toggle('readReceipts')} />
        <ToggleRow label="Show last seen" value={state.lastSeen} onChange={toggle('lastSeen')} />
        <ToggleRow label="Show online status" value={state.onlineStatus} onChange={toggle('onlineStatus')} />

        <SectionTitle>Who can…</SectionTitle>
        <ReadOnlyRow label="Message me" value={state.messagesFrom} />
        <ReadOnlyRow label="Call me" value={state.callsFrom} />
        <ReadOnlyRow label="See my stories" value={state.storyAudience} />
        <ReadOnlyRow label="Comment on my posts" value={state.commentsFrom} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginTop: 16, marginBottom: 6 }}>
      {String(children).toUpperCase()}
    </Text>
  );
}

function ReadOnlyRow({ label, value }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
        borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: 8,
      }}
    >
      <Text style={{ color: colors.text }}>{label}</Text>
      <Text style={{ color: colors.textMuted, textTransform: 'capitalize' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });