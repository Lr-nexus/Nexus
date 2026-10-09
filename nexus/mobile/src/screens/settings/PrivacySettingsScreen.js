import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import ToggleRow from './_ToggleRow';
import DropdownRow from '../../components/settings/DropdownRow';

const OPTIONS = {
  everyone: { key: 'everyone', label: 'Everyone' },
  followers: { key: 'followers', label: 'Followers' },
  contacts: { key: 'contacts', label: 'Contacts' },
  close: { key: 'close', label: 'Close friends' },
  nobody: { key: 'nobody', label: 'Nobody' },
};

const LIST = (keys) => keys.map((k) => OPTIONS[k]);

export default function PrivacySettingsScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();

  const [state, setState] = useState({
    privateAccount: false,
    readReceipts: true,
    lastSeen: true,
    onlineStatus: true,
    messagesFrom: 'everyone',
    callsFrom: 'contacts',
    storyAudience: 'followers',
    commentsFrom: 'everyone',
    mentionsFrom: 'everyone',
    tagsFrom: 'followers',
  });

  const toggle = (k) => (v) => setState((s) => ({ ...s, [k]: v }));
  const select = (k) => (v) => setState((s) => ({ ...s, [k]: v }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Privacy"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        <SectionTitle colors={colors}>ACCOUNT</SectionTitle>
        <ToggleRow
          label="Private account"
          value={state.privateAccount}
          onChange={toggle('privateAccount')}
          subtitle="Only followers can see your posts and stories."
        />

        <SectionTitle colors={colors}>ACTIVITY</SectionTitle>
        <ToggleRow label="Show read receipts" value={state.readReceipts} onChange={toggle('readReceipts')} />
        <ToggleRow label="Show last seen" value={state.lastSeen} onChange={toggle('lastSeen')} />
        <ToggleRow label="Show online status" value={state.onlineStatus} onChange={toggle('onlineStatus')} />

        <SectionTitle colors={colors}>WHO CAN…</SectionTitle>
        <DropdownRow
          label="Message me"
          value={state.messagesFrom}
          options={LIST(['everyone', 'followers', 'nobody'])}
          onChange={select('messagesFrom')}
          colors={colors}
        />
        <DropdownRow
          label="Call me"
          value={state.callsFrom}
          options={LIST(['everyone', 'contacts', 'nobody'])}
          onChange={select('callsFrom')}
          colors={colors}
        />
        <DropdownRow
          label="See my stories"
          value={state.storyAudience}
          options={LIST(['everyone', 'followers', 'close', 'nobody'])}
          onChange={select('storyAudience')}
          colors={colors}
        />
        <DropdownRow
          label="Comment on my posts"
          value={state.commentsFrom}
          options={LIST(['everyone', 'followers', 'nobody'])}
          onChange={select('commentsFrom')}
          colors={colors}
        />
        <DropdownRow
          label="Mention me"
          value={state.mentionsFrom}
          options={LIST(['everyone', 'followers', 'nobody'])}
          onChange={select('mentionsFrom')}
          colors={colors}
        />
        <DropdownRow
          label="Tag me"
          value={state.tagsFrom}
          options={LIST(['everyone', 'followers', 'nobody'])}
          onChange={select('tagsFrom')}
          colors={colors}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children, colors }) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});