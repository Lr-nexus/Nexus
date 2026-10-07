import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../utils/formatDate';

export default function ChatListItem({ item, onPress, currentUserId }) {
  const { colors, spacing, radius } = useTheme();

  const others = (item.participants || []).filter((p) => p._id !== currentUserId);
  const title =
    item.type === 'group'
      ? item.name || 'Group chat'
      : others[0]?.fullName || others[0]?.username || 'Chat';

  const avatarUser =
    item.type === 'group'
      ? { fullName: title, profilePicture: item.photo }
      : others[0] || {};

  const lastMsg = item.lastMessage;
  const preview = lastMsg?.content
    ? lastMsg.content
    : lastMsg?.type
    ? `📎 ${lastMsg.type}`
    : 'No messages yet';

  const unread = item.unreadCount || 0;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.md,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Avatar
        uri={avatarUser.profilePicture}
        name={title}
        size={52}
        ring={unread > 0}
        ringColor={colors.electricBlue}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.line}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.time, { color: colors.textDim }]}>
            {item.lastMessageAt ? formatDate(item.lastMessageAt) : ''}
          </Text>
        </View>

        <View style={styles.line}>
          <Text
            numberOfLines={1}
            style={[styles.preview, { color: colors.textMuted, flex: 1 }]}
          >
            {preview}
          </Text>
          {unread > 0 ? (
            <View
              style={[styles.unreadPill, { backgroundColor: colors.nexusBlue }]}
            >
              <Text style={styles.unreadTxt}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  time: { fontSize: 11 },
  preview: { fontSize: 13, marginTop: 2 },
  unreadPill: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
});