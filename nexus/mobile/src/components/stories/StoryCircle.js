import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function StoryCircle({
  user,
  hasStory = true,
  seen = false,
  isOwn = false,
  onPress,
  onAddPress,
}) {
  const { colors } = useTheme();
  const displayName = isOwn
    ? 'Your story'
    : user?.username || user?.fullName?.split(' ')[0] || 'User';

  const ringColor = seen
    ? colors.border
    : `hsl(${(user?.username?.length || 3) * 40}, 75%, 55%)`;

  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarWrap}>
        {/* Outer ring (only when user has story) */}
        <View
          style={[
            styles.ring,
            {
              borderColor: hasStory ? ringColor : 'transparent',
              borderWidth: hasStory ? 2 : 0,
            },
          ]}
        >
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={[
                styles.avatar,
                { borderColor: colors.bg, borderWidth: hasStory ? 2 : 0 },
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: colors.purple, borderColor: colors.bg, borderWidth: hasStory ? 2 : 0 },
              ]}
            >
              <Text style={styles.initials}>
                {(user?.fullName || user?.username || '?').slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* "+" badge for own story */}
        {isOwn ? (
          <TouchableOpacity
            style={[styles.addBadge, { backgroundColor: colors.nexusBlue, borderColor: colors.bg }]}
            onPress={onAddPress}
            activeOpacity={0.85}
            hitSlop={6}
          >
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text numberOfLines={1} style={[styles.name, { color: colors.textMuted }]}>
        {displayName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 76 },
  avatarWrap: { position: 'relative', width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontWeight: '800', fontSize: 20 },
  addBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  name: { fontSize: 11, marginTop: 6, fontWeight: '600', maxWidth: 70 },
});