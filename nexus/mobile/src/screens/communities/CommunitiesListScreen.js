import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { communitiesApi } from '../../api/communities.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonRow } from '../../components/common/Skeleton';

export default function CommunitiesListScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await communitiesApi.list();
      setItems(res.communities || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Communities"
        rightIcons={[
          { icon: <Text style={{ fontSize: 22 }}>＋</Text>, onPress: () => navigation.navigate('CreateCommunity') },
        ]}
      />

      {loading ? (
        <View style={{ padding: spacing.md }}><SkeletonRow count={5} /></View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
              onPress={() => navigation.navigate('Community', { communityId: item._id })}
            >
              <Avatar uri={item.photo} name={item.name} size={52} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>
                  {item.description || `${item.membersCount || 0} members`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="🏛️"
              title="No communities yet"
              subtitle="Create or join a community to get started."
              actionLabel="Create community"
              onAction={() => navigation.navigate('CreateCommunity')}
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.electricBlue} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center' } });