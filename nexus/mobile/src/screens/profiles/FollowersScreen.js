import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { usersApi } from '../../api/users.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import UserRow from '../../components/profile/UserRow';
import { Text } from 'react-native';
import { ROUTES } from '../../constants/routes';

export default function FollowersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // backend endpoint: GET /api/users/:id/followers
        const res = await usersApi.get(userId).catch(() => null);
        // best-effort: fall back to empty list
        setItems(res?.followers || []);
      } finally { setLoading(false); }
    })();
  }, [userId]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Followers"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => navigation.navigate(ROUTES.USER_PROFILE, { userId: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState emoji="👥" title="No followers yet" subtitle="When people follow this account, they'll appear here." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });