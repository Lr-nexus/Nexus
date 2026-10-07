import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export default function EmptyState({
  emoji = '🫥',
  title = 'Nothing here yet',
  subtitle = '',
  actionLabel,
  onAction,
  compact = false,
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.wrap, { padding: compact ? spacing.lg : spacing.xxl }]}>
      <Text style={{ fontSize: compact ? 36 : 52 }}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.text, marginTop: spacing.md }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.sub, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.lg, minWidth: 200 }}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 19 },
});