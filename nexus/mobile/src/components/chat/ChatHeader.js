import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';

export default function ChatHeader({ conversation, currentUserId, onBack, onCall, onVideo, onInfo }) {
  const { colors, spacing } = useTheme();

  const others = (conversation?.participants || []).filter((p) => p._id !== currentUserId);
  const title =
    conversation?.type === 'group'
      ? conversation?.name || 'Group'
      : others[0]?.fullName || others[0]?.username || 'Chat';
  const subtitle =
    conversation?.type === 'group'
      ? `${conversation.participants?.length || 0} members`
      : others[0]?.isOnline
      ? 'Online'
      : others[0]?.lastSeenAt
      ? `Last seen ${new Date(others[0].lastSeenAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : 'Offline';

  const avatarUser =
    conversation?.type === 'group'
      ? { fullName: title, profilePicture: conversation?.photo }
      : others[0] || {};

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bg }}>
      <View
        style={[
          styles.row,
          {
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.sm,
            paddingVertical: 8,
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.userRow} onPress={onInfo} activeOpacity={0.7}>
          <Avatar uri={avatarUser.profilePicture} name={title} size={40} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            <Text numberOfLines={1} style={[styles.sub, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCall} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="call-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onVideo} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="videocam-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  userRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 },
  title: { fontSize: 15, fontWeight: '700' },
  sub: { fontSize: 11, marginTop: 1 },
});