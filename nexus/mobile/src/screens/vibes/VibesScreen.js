import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, FlatList, Dimensions, StyleSheet, ActivityIndicator, Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { vibesApi } from '../../api/vibes.api';
import VibePlayer from '../../components/vibes/VibePlayer';
import VibeComments from '../../components/vibes/VibeComments';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const { height } = Dimensions.get('window');

export default function VibesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsFor, setCommentsFor] = useState(null);
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 70 });

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await vibesApi.feed({ limit: 20 });
      setVibes(res.vibes || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length) setActiveIndex(viewableItems[0].index ?? 0);
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: '#000' }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ErrorState message={error} onRetry={load} />
      </SafeAreaView>
    );
  }

  if (!vibes.length) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <EmptyState
          emoji="🎬"
          title="No vibes yet"
          subtitle="Be the first to post a short video."
          actionLabel="Create a vibe"
          onAction={() => navigation.navigate('CreateVibe')}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={vibes}
        keyExtractor={(i) => i._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item, index }) => (
          <VibePlayer
            vibe={item}
            isActive={index === activeIndex}
            onOpenComments={() => setCommentsFor(item)}
          />
        )}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
      />

      {commentsFor ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <VibeComments vibeId={commentsFor._id} onClose={() => setCommentsFor(null)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });