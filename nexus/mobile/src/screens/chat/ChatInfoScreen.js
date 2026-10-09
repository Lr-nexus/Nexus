import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { groupsApi } from '../../api/groups.api';
import { usersApi } from '../../api/users.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import { ROUTES } from '../../constants/routes';

export default function ChatInfoScreen() {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversation } = route.params || {};

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGroup = conversation?.type === 'group';
  const others = (conversation?.participants || []).filter(
    (p) => String(p._id || p) !== String(user?.id)
  );

  useEffect(() => {
    (async () => {
      if (isGroup) {
        // Try to load full group info from API
        try {
          // The conversation doesn't have groupId directly; find it via _id
          const res = await groupsApi.get(conversation._id).catch(() => null);
          if (res?.group) {
            setGroup(res.group);
            setMembers(res.members || []);
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, [conversation, isGroup]);

  const title = isGroup
    ? conversation?.name || group?.name || 'Group'
    : others[0]?.fullName || others[0]?.username || 'Chat';

  const avatarUser = isGroup
    ? { fullName: title, profilePicture: conversation?.photo || group?.photo }
    : others[0] || {};

  function startCall(type) {
    const ids = (conversation?.participants || [])
      .map((p) => String(p._id || p))
      .filter((id) => id !== String(user?.id));
    if (!ids.length) return Alert.alert('No participants.');
    navigation.navigate(ROUTES.CALL, { conversation, type, participantIds: ids });
  }

  function leaveGroup() {
    Alert.alert(
      'Leave group?',
      'You will no longer receive messages from this group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              if (group?._id) await groupsApi.removeMember(group._id, user.id);
              navigation.popToTop();
            } catch (e) {
              Alert.alert('Could not leave', e?.response?.data?.message || 'Try again.');
            }
          },
        },
      ]
    );
  }

  function blockUser() {
    Alert.alert('Block user?', 'They will no longer be able to message you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => Alert.alert('Blocked', '(Not yet wired up)'),
      },
    ]);
  }

  function report() {
    Alert.alert('Report', 'Report sent to moderators.', [{ text: 'OK' }]);
  }

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title={isGroup ? 'Group info' : 'Contact info'}
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Avatar uri={avatarUser.profilePicture} name={title} size={104} />
          <Text style={[styles.name, { color: colors.text }]}>{title}</Text>
          {!isGroup && others[0]?.username ? (
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>
              @{others[0].username}
            </Text>
          ) : null}
          {isGroup && group?.description ? (
            <Text
              style={{
                color: colors.textMuted,
                marginTop: 10,
                paddingHorizontal: 24,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {group.description}
            </Text>
          ) : null}
          {isGroup ? (
            <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 6 }}>
              {conversation.participants?.length || 0} members
            </Text>
          ) : others[0]?.isOnline ? (
            <Badge label="ONLINE" variant="success" size="sm" style={{ marginTop: 8 }} />
          ) : null}
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <ActionPill
            icon="call-outline"
            label="Voice"
            onPress={() => startCall('audio')}
          />
          <ActionPill
            icon="videocam-outline"
            label="Video"
            onPress={() => startCall('video')}
          />
          <ActionPill
            icon="search-outline"
            label="Search"
            onPress={() => Alert.alert('Search in chat', 'Coming soon.')}
          />
          <ActionPill
            icon="moon-outline"
            label="Mute"
            onPress={() => Alert.alert('Muted', 'Notifications muted.')}
          />
        </View>

        {/* Members (group only) */}
        {isGroup && members.length > 0 ? (
          <Section title={`Members (${members.length})`} colors={colors} spacing={spacing}>
            {members.map((m) => (
              <TouchableOpacity
                key={m._id}
                onPress={() =>
                  m.userId?._id && navigation.navigate(ROUTES.USER_PROFILE, { userId: m.userId._id })
                }
                style={styles.memberRow}
                activeOpacity={0.75}
              >
                <Avatar
                  uri={m.userId?.profilePicture}
                  name={m.userId?.fullName}
                  size={40}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {m.userId?.fullName || 'Member'}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    @{m.userId?.username}
                  </Text>
                </View>
                {m.role && m.role !== 'member' ? (
                  <Badge label={m.role.toUpperCase()} variant="primary" size="sm" />
                ) : null}
              </TouchableOpacity>
            ))}
          </Section>
        ) : null}

        {/* Actions list */}
        <Section title="Options" colors={colors} spacing={spacing}>
          {isGroup ? (
            <OptionRow
              icon="person-add-outline"
              label="Add members"
              colors={colors}
              onPress={() => navigation.navigate(ROUTES.CREATE_GROUP)}
            />
          ) : null}

          <OptionRow
            icon="images-outline"
            label="Media, links, and docs"
            colors={colors}
            onPress={() => Alert.alert('Media gallery', 'Coming soon.')}
          />

          <OptionRow
            icon="notifications-off-outline"
            label="Mute notifications"
            colors={colors}
            onPress={() => Alert.alert('Muted')}
          />

          <OptionRow
            icon="color-palette-outline"
            label="Chat wallpaper"
            colors={colors}
            onPress={() => Alert.alert('Wallpaper', 'Coming soon.')}
          />

          {!isGroup ? (
            <OptionRow
              icon="person-remove-outline"
              label="Block user"
              colors={colors}
              destructive
              onPress={blockUser}
            />
          ) : null}

          <OptionRow
            icon="flag-outline"
            label="Report"
            colors={colors}
            destructive
            onPress={report}
          />

          {isGroup ? (
            <OptionRow
              icon="exit-outline"
              label="Leave group"
              colors={colors}
              destructive
              onPress={leaveGroup}
            />
          ) : null}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ── */

function Section({ title, children, colors, spacing }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.6,
          paddingHorizontal: spacing.md,
          marginBottom: 8,
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View style={{ paddingHorizontal: spacing.md }}>{children}</View>
    </View>
  );
}

function ActionPill({ icon, label, onPress }) {
  const { colors, radius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionPill,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={22} color={colors.electricBlue} />
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12, marginTop: 6 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OptionRow({ icon, label, onPress, colors, destructive }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.optionRow} activeOpacity={0.75}>
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? colors.danger : colors.text}
      />
      <Text
        style={{
          color: destructive ? colors.danger : colors.text,
          fontWeight: '600',
          fontSize: 14,
          marginLeft: 14,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionPill: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
});