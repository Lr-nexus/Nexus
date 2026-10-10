import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileHeader({
  user,
  isMe = false,
  following = false,
  followRequested = false,
  followersCount = 0,
  followingCount = 0,
  postsCount = 0,
  onFollow,
  onMessage,
  onEdit,
  onFollowers,
  onFollowing,
  onSettings,
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ padding: spacing.lg }}>
      {/* Avatar + info row */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar
          uri={user?.profilePicture}
          name={user?.fullName}
          size={84}
          ring
        />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {user?.fullName || 'Nova user'}
            </Text>
            {user?.role === 'admin' ? (
              <Badge label="ADMIN" variant="primary" size="sm" />
            ) : null}
            {user?.isPrivate ? (
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
            ) : null}
          </View>

          <Text style={{ color: colors.textMuted, marginTop: 2 }}>
            @{user?.username || 'user'}
          </Text>

          {user?.bio ? (
            <Text
              style={{
                color: colors.text,
                marginTop: 6,
                fontSize: 13,
                lineHeight: 18,
              }}
              numberOfLines={3}
            >
              {user.bio}
            </Text>
          ) : null}

          {user?.website ? (
            <Text
              style={{
                color: colors.electricBlue,
                marginTop: 4,
                fontSize: 12,
              }}
              numberOfLines={1}
            >
              {user.website}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Stat label="Posts" value={postsCount || 0} colors={colors} />
        <TouchableOpacity onPress={onFollowers} style={styles.statBtn} activeOpacity={0.7}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {followersCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFollowing} style={styles.statBtn} activeOpacity={0.7}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {followingCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        {isMe ? (
          <>
            <Button
              title="Edit profile"
              variant="secondary"
              onPress={onEdit}
              fullWidth={false}
              style={{ flex: 1 }}
            />
            <Button
              title="Settings"
              variant="ghost"
              onPress={onSettings}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          </>
        ) : (
          <>
            <Button
              title={
                following
                  ? 'Following'
                  : followRequested
                  ? 'Requested'
                  : 'Follow'
              }
              variant={following || followRequested ? 'secondary' : 'primary'}
              onPress={onFollow}
              fullWidth={false}
              style={{ flex: 1 }}
            />
            <Button
              title="Message"
              variant="ghost"
              onPress={onMessage}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          </>
        )}
      </View>
    </View>
  );
}

function Stat({ label, value, colors }) {
  return (
    <View style={styles.statBtn}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 19, fontWeight: '800', includeFontPadding: false },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
  },
  statBtn: { alignItems: 'center', paddingHorizontal: 12 },
  statValue: { fontSize: 17, fontWeight: '800', includeFontPadding: false },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },
});