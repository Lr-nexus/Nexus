import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { groupsApi } from '../../api/groups.api';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

export default function CreateGroupScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function search(text) {
    setQ(text);
    if (!text.trim()) return setResults([]);
    setLoading(true);
    try {
      const res = await usersApi.search(text.trim());
      setResults((res.users || []).filter((u) => u._id !== user?.id));
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  function toggle(userItem) {
    setSelected((s) =>
      s.find((x) => x._id === userItem._id)
        ? s.filter((x) => x._id !== userItem._id)
        : [...s, userItem]
    );
  }

  async function create() {
  if (!name.trim()) return Alert.alert('Give your group a name');
  if (selected.length < 1) return Alert.alert('Add at least one member');

  setCreating(true);
  try {
    const res = await groupsApi.create({
      name: name.trim(),
      description: description.trim(),
      memberIds: selected.map((u) => u._id),
      isPrivate,
    });

    // Go back to the previous screen (Home or ChatsList)
    navigation.goBack();

    // Then open the group chat from the ChatsTab stack
    setTimeout(() => {
      navigation.navigate('ChatsTab', {
        screen: 'Chat',
        params: { conversation: res.conversation },
      });
    }, 120);
  } catch (e) {
    Alert.alert('Could not create group', e?.response?.data?.message || 'Try again.');
  } finally {
    setCreating(false);
  }
}

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="New group"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.md }}>
        <Input label="Group name" value={name} onChangeText={setName} placeholder="Weekend crew" />
        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="What's this group about?"
        />
        <Input
          label="Search people"
          value={q}
          onChangeText={search}
          placeholder="Name or @username"
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={() => setIsPrivate((v) => !v)}
          style={styles.privateRow}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {isPrivate ? '🔒 Private group' : '🌍 Public group'}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {isPrivate ? 'Members must be approved' : 'Anyone can join'}
          </Text>
        </TouchableOpacity>
      </View>

      {selected.length ? (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {selected.map((u) => (
            <TouchableOpacity
              key={u._id}
              onPress={() => toggle(u)}
              style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Avatar uri={u.profilePicture} name={u.fullName} size={20} />
              <Text style={{ color: colors.text, marginLeft: 6, fontSize: 12, fontWeight: '600' }}>
                {u.username}
              </Text>
              <Text style={{ color: colors.textMuted, marginLeft: 6 }}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => {
            const on = !!selected.find((s) => s._id === item._id);
            return (
              <TouchableOpacity
                style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
                onPress={() => toggle(item)}
              >
                <Avatar uri={item.profilePicture} name={item.fullName} size={42} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{item.fullName}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{item.username}</Text>
                </View>
                <View
                  style={[
                    styles.check,
                    { borderColor: on ? colors.electricBlue : colors.border, backgroundColor: on ? colors.electricBlue : 'transparent' },
                  ]}
                >
                  {on ? <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text> : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={{ padding: spacing.md }}>
        <Button
          title={creating ? 'Creating…' : `Create group${selected.length ? ` (${selected.length + 1})` : ''}`}
          onPress={create}
          loading={creating}
          disabled={!name.trim() || !selected.length}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  check: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  privateRow: { paddingVertical: 10 },
});