import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your internet connection and try again.',
  emoji = '😕',
  onRetry,
  retryLabel = 'Try again',
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.wrap, { padding: spacing.xxl }]}>
      <Text style={{ fontSize: 52 }}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.text, marginTop: spacing.md }]}>
        {title}
      </Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{message}</Text>
      {onRetry ? (
        <View style={{ marginTop: spacing.lg, minWidth: 200 }}>
          <Button title={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 19, maxWidth: 300 },
});