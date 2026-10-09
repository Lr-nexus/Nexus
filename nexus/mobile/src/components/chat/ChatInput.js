import React, { forwardRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Platform,
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
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.sm,
          paddingVertical: 8,
          gap: 8,
        },
      ]}
    >
      <TouchableOpacity onPress={onAttach} hitSlop={8} style={styles.iconBtn}>
        <Ionicons name="attach" size={24} color={colors.textMuted} />
      </TouchableOpacity>

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.pill,
            borderColor: colors.border,
          },
        ]}
      >
        <TextInput
          ref={ref}
          value={text}
          onChangeText={setText}
          placeholder="Send Message"
          placeholderTextColor={colors.textDim}
          multiline
          style={[styles.input, { color: colors.text }]}
        />
        <TouchableOpacity onPress={onRizz} hitSlop={8} style={styles.rizzBtn}>
          <Ionicons name="flame" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {text.trim() ? (
        <TouchableOpacity
          onPress={send}
          disabled={!canSend}
          style={[styles.sendBtn, { backgroundColor: colors.teal, borderRadius: radius.pill }]}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onVoicePress}
          style={[styles.sendBtn, { backgroundColor: colors.surface, borderRadius: radius.pill }]}
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
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    maxHeight: 130,
    paddingLeft: 16,
    paddingRight: 6,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    maxHeight: 120,
  },
  rizzBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});