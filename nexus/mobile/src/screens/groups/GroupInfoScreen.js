import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { groupsApi } from '../../api/groups.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function GroupInfoScreen() {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params || {};

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await groupsApi.get(groupId);
      setGroup(res.group);
      setMembers(res.members || []);
    } catch (e) {
      Alert.alert('Could not load group', e?.response?.data?.message || 'Try again.');
    } finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  async function leave() {
    Alert.alert('Leave group?', 'You will no longer receive messages.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupsApi.removeMember(groupId, user?.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Could not leave', e?.response?.data?.message || 'Try again.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const isAdmin = members.find((m) => m.userId?._id === user?.id)?.role === 'owner'
    || members.find((m) => m.userId?._id === user?.id)?.role === 'admin';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Group info"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.hero}>
          <Avatar uri={group?.photo} name={group?.name} size={96} />
          <Text style={[styles.name, { color: colors.text }]}>{group?.name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
            {members.length} member{members.length === 1 ? '' : 's'}
          </Text>
          {group?.description ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>
              {group.description}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Button
            title="Message group"
            onPress={() => navigation.navigate('Chat', { conversation: { _id: group.conversationId } })}
            fullWidth={false}
            style={{ flex: 1 }}
          />
          <Button
            title="Add members"
            variant="secondary"
            onPress={() => navigation.navigate('CreateGroup')}
            fullWidth={false}
            style={{ flex: 1 }}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Members</Text>

        {members.map((m) => (
          <View
            key={m._id}
            style={[styles.memberRow, { paddingVertical: 10 }]}
          >
            <Avatar uri={m.userId?.profilePicture} name={m.userId?.fullName} size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {m.userId?.fullName || 'Member'}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{m.userId?.username}</Text>
            </View>
            {m.role !== 'member' ? <Badge label={m.role.toUpperCase()} variant="primary" size="sm" /> : null}
            {isAdmin && m.userId?._id !== user?.id ? (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Remove member?', `Remove ${m.userId?.username}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: async () => {
                        await groupsApi.removeMember(groupId, m.userId._id);
                        setMembers((list) => list.filter((x) => x._id !== m._id));
                      },
                    },
                  ]);
                }}
                style={{ marginLeft: 8 }}
              >
                <Text style={{ color: colors.danger, fontWeight: '700' }}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        <View style={{ marginTop: 24 }}>
          <Button title="Leave group" variant="danger" onPress={leave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { alignItems: 'center', paddingVertical: 20 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 24, marginBottom: 6 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
});