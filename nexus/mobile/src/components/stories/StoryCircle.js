import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';

export default function StoryCircle({
  user,
  hasStory = true,
  seen = false,
  isOwn = false,
  onPress,
  onAddPress,
}) {
  const { colors, spacing } = useTheme();
  const displayName = user?.username || user?.fullName?.split(' ')[0] || 'You';

  return (
    <TouchableOpacity
      style={[styles.wrap, { marginRight: spacing.md }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.avatarWrap}>
        <Avatar
          uri={user?.profilePicture}
          name={user?.fullName}
          size={64}
          ring={hasStory}
          ringColor={
            seen
              ? colors.border
              : `hsl(${(user?.username?.length || 3) * 40}, 75%, 55%)`
          }
        />
        {isOwn ? (
          <TouchableOpacity
            style={[styles.addBadge, { backgroundColor: colors.nexusBlue, borderColor: colors.bg }]}
            onPress={onAddPress}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[styles.name, { color: colors.textMuted }]}>
        {isOwn ? 'Your story' : displayName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 76 },
  avatarWrap: { position: 'relative' },
  name: { fontSize: 11, marginTop: 6, fontWeight: '600' },
  addBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});