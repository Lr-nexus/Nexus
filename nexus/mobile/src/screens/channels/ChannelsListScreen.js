import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { channelsApi } from '../../api/channels.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonRow } from '../../components/common/Skeleton';

export default function ChannelsListScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await channelsApi.list();
      setItems(res.channels || []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Channels"
        rightIcons={[
          { icon: <Text style={{ fontSize: 22 }}>＋</Text>, onPress: () => navigation.navigate('CreateChannel') },
        ]}
      />

      {loading ? (
        <View style={{ padding: spacing.md }}><SkeletonRow count={5} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}
              onPress={() => navigation.navigate('Channel', { channelId: item._id })}
            >
              <Avatar uri={item.photo} name={item.name} size={52} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>
                  {item.subscribersCount || 0} subscribers
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="📢"
              title="No channels yet"
              subtitle="Create a channel to broadcast to your audience."
              actionLabel="Create channel"
              onAction={() => navigation.navigate('CreateChannel')}
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