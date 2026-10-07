import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import EmptyState from '../../components/common/EmptyState';

// This screen is typically rendered as a row inside HomeScreen.
// Kept here for deep-links.
export default function StoriesFeedScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={{ flex: 1 }}>
        <EmptyState
          emoji="✨"
          title="Stories live on Home"
          subtitle="Open Home to see stories from people you follow."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });