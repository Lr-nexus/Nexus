import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export default function MessageActions({ visible, message, mine, onClose, onAction }) {
  const { colors, spacing, radius } = useTheme();
  if (!visible) return null;

  const actions = [
    { key: 'reply', label: 'Reply', emoji: '↩️' },
    { key: 'copy', label: 'Copy', emoji: '📋' },
    { key: 'forward', label: 'Forward', emoji: '↗️' },
    { key: 'pin', label: 'Pin', emoji: '📌' },
    { key: 'star', label: 'Star', emoji: '⭐️' },
    ...(mine ? [{ key: 'edit', label: 'Edit', emoji: '✏️' }] : []),
    ...(mine ? [{ key: 'delete', label: 'Delete', emoji: '🗑️', destructive: true }] : []),
    { key: 'report', label: 'Report', emoji: '🚩', destructive: true },
  ];

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingBottom: 24,
          },
        ]}
      >
        <View style={[styles.grabber, { backgroundColor: colors.border }]} />

        <View style={styles.reactionRow}>
          {REACTIONS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.reactBtn, { backgroundColor: colors.card }]}
              onPress={() => {
                onAction?.('react', e);
                onClose?.();
              }}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {actions.map((a) => (
          <TouchableOpacity
            key={a.key}
            onPress={() => {
              onAction?.(a.key);
              onClose?.();
            }}
            style={[styles.actionRow, { paddingHorizontal: spacing.lg }]}
          >
            <Text style={{ fontSize: 18, marginRight: 14 }}>{a.emoji}</Text>
            <Text
              style={{
                color: a.destructive ? colors.danger : colors.text,
                fontSize: 15,
                fontWeight: '600',
              }}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 8 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reactBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { height: 52, flexDirection: 'row', alignItems: 'center' },
});