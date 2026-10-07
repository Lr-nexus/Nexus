import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { searchApi } from '../../api/search.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';

const { width } = Dimensions.get('window');
const TILE = (width - 6) / 3;

export default function HashtagScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { tag } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await searchApi.hashtag(tag);
      setData(res);
    } catch {} finally { setLoading(false); }
  }, [tag]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title={`#${tag}`}
        subtitle={`${data?.posts?.length || 0} posts · ${data?.vibes?.length || 0} vibes`}
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <FlatList
        data={data?.posts || []}
        keyExtractor={(i) => i._id}
        numColumns={3}
        ListEmptyComponent={
          <EmptyState emoji="🏷️" title="No posts yet" subtitle={`Be the first to post with #${tag}.`} />
        }
        renderItem={({ item }) => {
          const media = item.media?.[0]?.url;
          return (
            <TouchableOpacity
              style={{ width: TILE, height: TILE, margin: 1 }}
              onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
            >
              {media ? (
                <Image source={{ uri: media }} style={{ flex: 1 }} />
              ) : (
                <View style={{ flex: 1, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', padding: 6 }}>
                  <Text numberOfLines={4} style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                    {item.caption}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });