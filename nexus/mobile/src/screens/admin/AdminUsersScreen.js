import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../api/admin.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import BottomSheet from '../../components/common/BottomSheet';
import useDebounce from '../../hooks/useDebounce';

export default function AdminUsersScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 350);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.users({ q: debounced, limit: 50 });
      setUsers(res.users || []);
    } catch {} finally { setLoading(false); }
  }, [debounced]);

  useEffect(() => { load(); }, [load]);

  async function act(fn, label) {
    if (!target) return;
    try {
      await fn(target._id);
      Alert.alert('Done', label);
      setTarget(null);
      load();
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || 'Try again.');
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Users"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <View style={{ padding: spacing.md }}>
        <Input
          placeholder="Search users by name, email or username"
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
        />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setTarget(item)}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: 8,
                },
              ]}
            >
              <Avatar uri={item.profilePicture} name={item.fullName} size={42} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.fullName}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>
                  @{item.username} · {item.email}
                </Text>
              </View>
              <Text
                style={{
                  color: item.status === 'active' ? colors.success : colors.danger,
                  fontSize: 11,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                }}
              >
                {item.status}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <BottomSheet
        visible={!!target}
        onClose={() => setTarget(null)}
        title={target ? `Manage @${target.username}` : ''}
        items={[
          { label: 'Activate user', onPress: () => act(adminApi.activateUser, 'User activated.') },
          { label: 'Suspend user', onPress: () => act(adminApi.suspendUser, 'User suspended.') },
          { label: 'Ban user', destructive: true, onPress: () => act(adminApi.banUser, 'User banned.') },
          { label: 'Delete user', destructive: true, onPress: () => act(adminApi.deleteUser, 'User deleted.') },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});