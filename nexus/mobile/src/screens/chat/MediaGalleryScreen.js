import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Image, Dimensions, Linking, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { conversationsApi } from '../../api/conversations.api';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';

const { width } = Dimensions.get('window');
const TILE = (width - 8) / 3;

const TABS = [
  { key: 'images', label: 'Photos', icon: 'image-outline' },
  { key: 'videos', label: 'Videos', icon: 'videocam-outline' },
  { key: 'audio', label: 'Audio', icon: 'musical-notes-outline' },
  { key: 'files', label: 'Docs', icon: 'document-outline' },
  { key: 'links', label: 'Links', icon: 'location-outline' },
  { key: 'contacts', label: 'Contacts', icon: 'person-outline' },
];

export default function MediaGalleryScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversation } = route.params || {};

  const [tab, setTab] = useState('images');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await conversationsApi.media(conversation._id);
      setData(res.media || {});
    } catch {} finally { setLoading(false); }
  }, [conversation?._id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
        <Header
          title="Media"
          leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
          onLeftPress={() => navigation.goBack()}
        />
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const items = data?.[tab] || [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Media"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Tab strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: 10, gap: 8 }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = data?.[t.key]?.length || 0;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.nexusBlue : colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name={t.icon} size={14} color={active ? '#fff' : colors.text} />
              <Text
                style={{
                  color: active ? '#fff' : colors.text,
                  fontWeight: '700',
                  fontSize: 12,
                  marginLeft: 5,
                  includeFontPadding: false,
                }}
              >
                {t.label}
                {count > 0 ? ` · ${count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {items.length === 0 ? (
        <EmptyState emoji="📭" title={`No ${tab} in this chat`} compact />
      ) : tab === 'images' ? (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: TILE, height: TILE, margin: 1 }}
              onPress={() => Linking.openURL(item.media.url).catch(() => {})}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.media.url }} style={{ flex: 1 }} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => item.media?.url && Linking.openURL(item.media.url).catch(() => {})}
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
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.card }]}>
                <Ionicons
                  name={TABS.find((t) => t.key === tab)?.icon || 'document-outline'}
                  size={22}
                  color={colors.electricBlue}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={1} style={{ color: colors.text, fontWeight: '700' }}>
                  {item.media?.name || item.content || TABS.find((t) => t.key === tab)?.label}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Tap to open
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});