import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { groupsApi } from '../../api/groups.api';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useDebounce from '../../hooks/useDebounce';

export default function AddMembersScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, existingIds = [] } = route.params || {};

  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const search = useCallback(async (query) => {
    if (!query.trim()) return setResults([]);
    setLoading(true);
    try {
      const res = await usersApi.search(query.trim());
      const existing = new Set(existingIds.map(String));
      setResults(
        (res.users || []).filter(
          (u) => String(u._id) !== String(user?.id) && !existing.has(String(u._id))
        )
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, existingIds.join(',')]);

  useEffect(() => { search(debounced); }, [debounced, search]);

  function toggle(u) {
    setSelected((s) =>
      s.find((x) => x._id === u._id) ? s.filter((x) => x._id !== u._id) : [...s, u]
    );
  }

  async function add() {
    if (!selected.length) return Alert.alert('Pick at least one person');
    setSaving(true);
    try {
      await groupsApi.addMembers(groupId, selected.map((u) => u._id));
      Alert.alert('Added', `${selected.length} member(s) added.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not add', e?.response?.data?.message || 'Try again.');
    } finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Add members"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ padding: spacing.md }}>
        <Input
          placeholder="Search Nova users…"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          value={q}
          onChangeText={setQ}
        />
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
              <Ionicons name="close" size={14} color={colors.textMuted} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
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
                activeOpacity={0.75}
              >
                <Avatar uri={item.profilePicture} name={item.fullName} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{item.fullName}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{item.username}</Text>
                </View>
                <View
                  style={[
                    styles.check,
                    {
                      borderColor: on ? colors.electricBlue : colors.border,
                      backgroundColor: on ? colors.electricBlue : 'transparent',
                    },
                  ]}
                >
                  {on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            q.trim() ? (
              <EmptyState emoji="🔍" title="No users found" compact />
            ) : (
              <EmptyState emoji="👥" title="Add members" subtitle="Search by name or @username." compact />
            )
          }
        />
      )}

      <View style={{ padding: spacing.md }}>
        <Button
          title={saving ? 'Adding…' : `Add${selected.length ? ` (${selected.length})` : ''}`}
          onPress={add}
          loading={saving}
          disabled={!selected.length}
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
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});