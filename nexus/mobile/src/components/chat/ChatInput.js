import React, { forwardRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const ChatInput = forwardRef(function ChatInput(
  { onSend, onAttach, onRizz, onVoicePress, sending = false },
  ref
) {
  const { colors, radius, spacing } = useTheme();
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !sending;

  function send() {
    if (!canSend) return;
    onSend?.(text.trim());
    setText('');
  }

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.sm,
          paddingVertical: 8,
          gap: 6,
        },
      ]}
    >
      <TouchableOpacity onPress={onAttach} hitSlop={8} style={styles.iconBtn}>
        <Ionicons name="add-circle-outline" size={26} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRizz} hitSlop={8} style={styles.iconBtn}>
        <Ionicons name="flame" size={22} color="#EF4444" />
      </TouchableOpacity>

      <TextInput
        ref={ref}
        value={text}
        onChangeText={setText}
        placeholder="Message…"
        placeholderTextColor={colors.textDim}
        multiline
        style={[
          styles.input,
          {
            backgroundColor: colors.bg,
            color: colors.text,
            borderRadius: radius.pill,
            borderColor: colors.border,
          },
        ]}
      />

      {text.trim() ? (
        <TouchableOpacity
          onPress={send}
          disabled={!canSend}
          style={[styles.sendBtn, { backgroundColor: colors.nexusBlue, borderRadius: radius.pill }]}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onVoicePress}
          style={[styles.sendBtn, { backgroundColor: colors.card, borderRadius: radius.pill }]}
        >
          <Ionicons name="mic-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default ChatInput;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    borderWidth: 1,
  },
  sendBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});