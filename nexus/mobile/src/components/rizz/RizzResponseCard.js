import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';

export default function RizzResponseCard({ text, style, index, onSendToChat }) {
  const { colors, radius, spacing } = useTheme();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copy() {
    await Clipboard.setStringAsync(text);
  }

  async function save() {
    if (saved || busy) return;
    setBusy(true);
    try {
      await rizzApi.save({ content: text, style });
      setSaved(true);
    } catch {} finally { setBusy(false); }
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: colors.electricBlue, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
          OPTION {index + 1}
        </Text>
        {style ? (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              marginLeft: 10,
              textTransform: 'capitalize',
            }}
          >
            · {style}
          </Text>
        ) : null}
      </View>

      <Text
        selectable
        style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}
      >
        {text}
      </Text>

      <View style={styles.actionsRow}>
        <CardBtn emoji="📋" label="Copy" onPress={copy} />
        {onSendToChat ? (
          <CardBtn emoji="↗️" label="Send" onPress={() => onSendToChat(text)} />
        ) : null}
        <CardBtn
          emoji={saved ? '✅' : '⭐️'}
          label={saved ? 'Saved' : 'Save'}
          onPress={save}
        />
      </View>
    </View>
  );
}

function CardBtn({ emoji, label, onPress }) {
  const { colors, radius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md },
      ]}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 13 }}>{emoji}</Text>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
});