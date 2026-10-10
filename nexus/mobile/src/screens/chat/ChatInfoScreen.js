import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { groupsApi } from '../../api/groups.api';
import { conversationsApi } from '../../api/conversations.api';
import { uploadService } from '../../services/upload.service';
import { pickImage } from '../../utils/media';
import { chatSettings } from '../../services/chatSettings.service';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import { ROUTES } from '../../constants/routes';

export default function ChatInfoScreen() {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const initialConversation = route.params?.conversation;

  const [conversation, setConversation] = useState(initialConversation);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isGroup = conversation?.type === 'group';
  const others = (conversation?.participants || []).filter(
    (p) => String(p._id || p) !== String(user?.id)
  );

  const title = isGroup
    ? conversation?.name || group?.name || 'Group'
    : others[0]?.fullName || others[0]?.username || 'Chat';

  const avatarUser = isGroup
    ? { fullName: title, profilePicture: conversation?.photo || group?.photo }
    : others[0] || {};

  const load = useCallback(async () => {
    if (!conversation?._id) return;
    try {
      const isMutedNow = await chatSettings.isMuted(conversation._id);
      setMuted(isMutedNow);

      if (isGroup) {
        const res = await groupsApi.get(conversation._id).catch(() => null);
        if (res?.group) {
          setGroup(res.group);
          setMembers(res.members || []);
        }
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }, [conversation?._id, isGroup]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function startCall(type) {
    const ids = (conversation?.participants || [])
      .map((p) => String(p._id || p))
      .filter((id) => id !== String(user?.id));
    if (!ids.length) return Alert.alert('No participants.');
    navigation.navigate(ROUTES.CALL, { conversation, type, participantIds: ids });
  }

  async function toggleMute() {
    const now = await chatSettings.toggleMuted(conversation._id);
    setMuted(now);
    Alert.alert(now ? 'Muted' : 'Unmuted');
  }

  async function changeWallpaper() {
    try {
      const a = await pickImage({ allowsEditing: false, quality: 0.9 });
      if (!a) return;
      setUploading(true);
      const up = await uploadService.uploadImage(a.uri);
      await chatSettings.setWallpaper(conversation._id, up.url);
      Alert.alert('Wallpaper set');
    } catch (e) {
      Alert.alert('Could not set wallpaper', e?.response?.data?.message || e.message);
    } finally {
      setUploading(false);
    }
  }

  function clearWallpaper() {
    Alert.alert('Remove wallpaper?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await chatSettings.clearWallpaper(conversation._id);
          Alert.alert('Wallpaper removed');
        },
      },
    ]);
  }

  async function changeGroupPhoto() {
    try {
      const a = await pickImage({ allowsEditing: true, quality: 0.9, aspect: [1, 1] });
      if (!a) return;
      setUploading(true);
      const up = await uploadService.uploadImage(a.uri);
      const gid = group?._id || conversation._id;
      await groupsApi.update(gid, { photo: up.url });
      setGroup((g) => ({ ...g, photo: up.url }));
      setConversation((c) => ({ ...c, photo: up.url }));
    } catch (e) {
      Alert.alert('Could not update photo', e?.response?.data?.message || 'Try again.');
    } finally {
      setUploading(false);
    }
  }

  async function toggleLock() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      let authed = true;

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: conversation.locked ? 'Unlock this chat' : 'Lock this chat',
          fallbackLabel: 'Use device passcode',
          disableDeviceFallback: false,
          cancelLabel: 'Cancel',
        });
        authed = result.success;
      }

      if (!authed) return;

      const next = !conversation.locked;
      await conversationsApi.setLocked(conversation._id, next);
      setConversation((c) => ({ ...c, locked: next }));
      Alert.alert(next ? 'Chat locked' : 'Chat unlocked');
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || 'Try again');
    }
  }

  function leaveGroup() {
    Alert.alert('Leave group?', 'You will no longer receive messages.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            const gid = group?._id || conversation._id;
            await groupsApi.removeMember(gid, user.id);
            navigation.navigate(ROUTES.CHATS_TAB, { screen: ROUTES.CHATS_LIST });
          } catch (e) {
            Alert.alert('Could not leave', e?.response?.data?.message || 'Try again.');
          }
        },
      },
    ]);
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

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity
            onPress={isGroup ? changeGroupPhoto : undefined}
            activeOpacity={isGroup ? 0.85 : 1}
            disabled={!isGroup || uploading}
          >
            <View style={{ position: 'relative' }}>
              <Avatar uri={avatarUser.profilePicture} name={title} size={104} />
              {isGroup ? (
                <View
                  style={[
                    styles.cameraBadge,
                    { backgroundColor: colors.nexusBlue, borderColor: colors.bg },
                  ]}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={14} color="#fff" />
                  )}
                </View>
              ) : null}
            </View>
          </TouchableOpacity>

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

        {/* Quick actions row (single mute control) */}
        <View style={styles.actionsRow}>
          <ActionPill icon="call-outline" label="Voice" onPress={() => startCall('audio')} />
          <ActionPill icon="videocam-outline" label="Video" onPress={() => startCall('video')} />
          <ActionPill
            icon="search-outline"
            label="Search"
            onPress={() => navigation.navigate(ROUTES.CHAT_SEARCH, { conversation })}
          />
          <ActionPill
            icon={muted ? 'notifications-outline' : 'notifications-off-outline'}
            label={muted ? 'Unmute' : 'Mute'}
            onPress={toggleMute}
          />
        </View>

        {/* Group members */}
        {isGroup && members.length > 0 ? (
          <Section title={`Members (${members.length})`} colors={colors} spacing={spacing}>
            {members.map((m) => (
              <TouchableOpacity
                key={m._id}
                onPress={() =>
                  m.userId?._id &&
                  navigation.navigate(ROUTES.USER_PROFILE, { userId: m.userId._id })
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

        {/* Options (mute removed from here — only in the pills row) */}
        <Section title="Options" colors={colors} spacing={spacing}>
          {isGroup ? (
            <OptionRow
              icon="person-add-outline"
              label="Add members"
              colors={colors}
              onPress={() =>
                navigation.navigate(ROUTES.ADD_MEMBERS, {
                  groupId: group?._id || conversation._id,
                  existingIds: members.map((m) => String(m.userId?._id)).filter(Boolean),
                })
              }
            />
          ) : null}

          <OptionRow
            icon={conversation.locked ? 'lock-open-outline' : 'lock-closed-outline'}
            label={conversation.locked ? 'Unlock chat' : 'Lock chat'}
            colors={colors}
            onPress={toggleLock}
          />

          <OptionRow
            icon="images-outline"
            label="Media, links, and docs"
            colors={colors}
            onPress={() => navigation.navigate(ROUTES.MEDIA_GALLERY, { conversation })}
          />

          <OptionRow
            icon="image-outline"
            label="Chat wallpaper"
            colors={colors}
            onPress={changeWallpaper}
          />

          <OptionRow
            icon="trash-outline"
            label="Remove wallpaper"
            colors={colors}
            onPress={clearWallpaper}
          />

          <OptionRow
            icon="flag-outline"
            label="Report"
            colors={colors}
            destructive
            onPress={() => Alert.alert('Reported')}
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
          includeFontPadding: false,
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
      <Text
        style={{
          color: colors.text,
          fontWeight: '700',
          fontSize: 12,
          marginTop: 6,
          includeFontPadding: false,
        }}
      >
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
          includeFontPadding: false,
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
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    includeFontPadding: false,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
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