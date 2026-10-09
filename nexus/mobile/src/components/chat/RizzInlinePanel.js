import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';
import { RIZZ_STYLES } from '../../constants/rizzStyles';

const QUICK_ACTIONS = [
  { key: 'reply', label: 'Reply to them', emoji: '💬', placeholder: 'Paste or type what they said…' },
  { key: 'rewrite', label: 'Rewrite my draft', emoji: '✍️', placeholder: 'Type your draft message…' },
  { key: 'starter', label: 'Start fresh', emoji: '🚀', placeholder: 'Give a hint (dating, work, casual…)' },
  { key: 'rescue', label: 'Rescue this chat', emoji: '🚑', placeholder: 'Paste the dry last message…' },
];

export default function RizzInlinePanel({
  visible,
  onClose,
  onUseMessage,
  recentContext = '',
}) {
  const { colors, spacing, radius } = useTheme();
  const scrollRef = useRef(null);

  const [action, setAction] = useState('reply');
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('smooth');
  const [useContext, setUseContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);

  if (!visible) return null;

  const cfg = QUICK_ACTIONS.find((a) => a.key === action) || QUICK_ACTIONS[0];

  async function generate() {
    if (action !== 'starter' && !input.trim()) {
      return Alert.alert('Add some context first');
    }
    Keyboard.dismiss();
    setLoading(true);
    setResponses([]);
    try {
      const context = useContext ? recentContext : '';
      let res;

      if (action === 'reply') {
        res = await rizzApi.reply({ message: input.trim(), style, context });
      } else if (action === 'rewrite') {
        res = await rizzApi.rewrite({ message: input.trim(), tone: 'more confident', style });
      } else if (action === 'starter') {
        res = await rizzApi.starter({ category: input.trim() || 'general', style });
      } else if (action === 'rescue') {
        res = await rizzApi.rescue({ lastMessage: input.trim(), style });
      }

      setResponses(res?.responses || []);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    } catch (e) {
      Alert.alert(
        'Rizz AI',
        e?.response?.data?.message || '🔥 Rizz AI is temporarily unavailable. Try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmSend(text) {
    Alert.alert(
      'Send this message?',
      text,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            onUseMessage?.(text);
            onClose?.();
          },
        },
      ]
    );
  }

  async function copy(text) {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied');
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}>
        <View style={[styles.headerIcon, { backgroundColor: '#EF4444' }]}>
          <Ionicons name="flame" size={16} color="#fff" />
        </View>
        <Text style={{ color: colors.text, fontWeight: '800', marginLeft: 10, fontSize: 15, flex: 1 }}>
          Rizz AI
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ maxHeight: 420 }}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
        >
          {QUICK_ACTIONS.map((a) => {
            const active = action === a.key;
            return (
              <TouchableOpacity
                key={a.key}
                onPress={() => { setAction(a.key); setResponses([]); }}
                style={[
                  styles.actionChip,
                  {
                    backgroundColor: active ? colors.nexusBlue : colors.card,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Text style={{ fontSize: 12 }}>{a.emoji}</Text>
                <Text
                  style={{
                    color: active ? '#fff' : colors.text,
                    fontWeight: '700',
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Input */}
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={cfg.placeholder}
          placeholderTextColor={colors.textDim}
          multiline
          style={[
            styles.input,
            {
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: radius.md,
            },
          ]}
        />

        {/* Chat context toggle */}
        <TouchableOpacity
          onPress={() => setUseContext((v) => !v)}
          style={styles.contextRow}
          activeOpacity={0.75}
        >
          <Ionicons
            name={useContext ? 'checkbox' : 'square-outline'}
            size={18}
            color={useContext ? colors.nexusBlue : colors.textMuted}
          />
          <Text style={{ color: colors.textMuted, marginLeft: 8, fontSize: 12 }}>
            Use last messages as context
          </Text>
        </TouchableOpacity>

        {/* Vibe chips */}
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '800', marginTop: 10, marginBottom: 6, letterSpacing: 0.5 }}>
          VIBE
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {RIZZ_STYLES.map((s) => {
            const active = style === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setStyle(s.key)}
                style={[
                  styles.vibeChip,
                  {
                    backgroundColor: active ? colors.nexusBlue : colors.card,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Text style={{ fontSize: 12 }}>{s.emoji}</Text>
                <Text
                  style={{
                    color: active ? '#fff' : colors.text,
                    fontWeight: '700',
                    fontSize: 11,
                    marginLeft: 4,
                  }}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Generate button */}
        <TouchableOpacity
          onPress={generate}
          disabled={loading}
          style={[
            styles.generateBtn,
            { backgroundColor: colors.nexusBlue, borderRadius: radius.md },
          ]}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 6, fontSize: 14 }}>
                Generate
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Responses */}
        {responses.map((r, i) => (
          <View
            key={i}
            style={[
              styles.respCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md },
            ]}
          >
            <Text selectable style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
              {r}
            </Text>
            <View style={styles.respActions}>
              <TouchableOpacity
                onPress={() => confirmSend(r)}
                style={[styles.respBtn, { backgroundColor: colors.nexusBlue, borderRadius: radius.sm }]}
              >
                <Ionicons name="paper-plane" size={13} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, marginLeft: 5 }}>
                  Send
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => copy(r)}
                style={[styles.respBtn, { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm }]}
              >
                <Ionicons name="copy-outline" size={13} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12, marginLeft: 5 }}>
                  Copy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={generate}
                style={[styles.respBtn, { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm }]}
              >
                <Ionicons name="refresh" size={13} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12, marginLeft: 5 }}>
                  Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {!responses.length && !loading ? (
          <Text style={{ color: colors.textDim, fontSize: 12, textAlign: 'center', marginTop: 14 }}>
            Tap Generate to get suggestions. Nothing sends automatically.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderTopWidth: 1, maxHeight: 520 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  actionChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1,
  },
  input: {
    marginTop: 10, minHeight: 68, maxHeight: 140, padding: 12, borderWidth: 1,
    textAlignVertical: 'top', fontSize: 14,
  },
  contextRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  vibeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1,
  },
  generateBtn: {
    marginTop: 14, height: 46,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row',
  },
  respCard: { marginTop: 10, padding: 12, borderWidth: 1 },
  respActions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  respBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
  },
});