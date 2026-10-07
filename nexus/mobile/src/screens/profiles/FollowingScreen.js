import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { usersApi } from '../../api/users.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import UserRow from '../../components/profile/UserRow';
import { ROUTES } from '../../constants/routes';

export default function FollowingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await usersApi.get(userId).catch(() => null);
        setItems(res?.following || []);
      } finally { setLoading(false); }
    })();
  }, [userId]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Following"
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
            <EmptyState emoji="🤝" title="Not following anyone yet" subtitle="Follow people to see their posts." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });