import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { rizzApi } from '../../api/rizz.api';
import RizzAvatar from '../../components/rizz/RizzAvatar';
import RizzStyleChip from '../../components/rizz/RizzStyleChip';
import RizzResponseCard from '../../components/rizz/RizzResponseCard';
import Button from '../../components/common/Button';
import { RIZZ_STYLES } from '../../constants/rizzStyles';
import { ROUTES } from '../../constants/routes';

const MODES = {
  reply: {
    title: 'What should I reply?',
    field: 'What they said…',
    placeholder: '"You are actually funny 😂"',
    call: (input, style) => rizzApi.reply({ message: input, style }),
  },
  chat: {
    title: 'Ask Rizz AI',
    field: 'What do you need help with?',
    placeholder: 'Help me start a conversation with my crush…',
    call: (input, style) => rizzApi.chat({ message: input, style }),
  },
  rewrite: {
    title: 'Rewrite my message',
    field: 'Your message',
    placeholder: '"Do you want to hang out sometime?"',
    call: (input, style) => rizzApi.rewrite({ message: input, tone: 'more confident', style }),
  },
  compliment: {
    title: 'Compliment someone',
    field: 'Their vibe (optional)',
    placeholder: 'Kind, artistic, loves music…',
    call: (input, style) => rizzApi.compliment({ vibe: input, style }),
  },
  starter: {
    title: 'Conversation starter',
    field: 'Context (dating, new friend, work…)',
    placeholder: 'Dating',
    call: (input, style) => rizzApi.starter({ category: input || 'general', style }),
  },
  rescue: {
    title: 'Rescue my conversation',
    field: 'Last message (or "it went dry")',
    placeholder: '"lol"',
    call: (input, style) => rizzApi.rescue({ lastMessage: input, style }),
  },
};

const TONE_OPTIONS = ['More confident', 'More playful', 'More romantic', 'Shorter', 'Longer', 'Less awkward'];

export default function RizzChatScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params || {};
  const mode = params.mode || 'reply';
  const cfg = MODES[mode] || MODES.reply;

  const [input, setInput] = useState(params.context || '');
  const [style, setStyle] = useState('smooth');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  async function generate() {
    if (!input.trim() && mode !== 'compliment' && mode !== 'starter') {
      return Alert.alert('Add some context first');
    }
    Keyboard.dismiss();
    setLoading(true);
    setResponses([]);
    try {
      const res = await cfg.call(input.trim(), style);
      setResponses(res.responses || []);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    } catch (e) {
      Alert.alert(
        'Rizz AI',
        e?.response?.data?.message || '🔥 Rizz AI is temporarily unavailable. Try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    if (!input.trim()) return;
    await generate();
  }

  async function refine(option) {
    if (!responses.length) return;
    setRefining(true);
    try {
      // Uses rewrite endpoint to refine the first response in the chosen direction
      const res = await rizzApi.rewrite({
        message: responses[0],
        tone: option.toLowerCase(),
        style,
      });
      if (res.responses?.length) {
        setResponses((prev) => [res.responses[0], ...prev.slice(1)]);
      }
    } catch (e) {
      Alert.alert('Rizz AI', e?.response?.data?.message || 'Could not refine.');
    } finally {
      setRefining(false);
    }
  }

  function sendToChat(text) {
    if (params.conversationId) {
      navigation.navigate('Chat', {
        conversation: { _id: params.conversationId },
        prefill: text,
      });
    } else {
      Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Paste it anywhere — it is on your clipboard.');
    }
  }

  const headerTitle = cfg.title;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingHorizontal: spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>
        </TouchableOpacity>
        <RizzAvatar size={34} pulsing={loading} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Rizz AI</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{headerTitle}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.RIZZ_HISTORY)}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Text style={{ fontSize: 18 }}>🕘</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Context input */}
          <Text style={[styles.label, { color: colors.textMuted }]}>{cfg.field}</Text>
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder={cfg.placeholder}
            placeholderTextColor={colors.textDim}
            multiline
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          />

          {params.context ? (
            <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
              Prefilled from your chat · only what you see here is sent to Gemini.
            </Text>
          ) : null}

          {/* Style chips */}
          <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>Vibe</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {RIZZ_STYLES.map((s) => (
              <RizzStyleChip
                key={s.key}
                style={s.key}
                label={s.label}
                emoji={s.emoji}
                active={style === s.key}
                onPress={() => setStyle(s.key)}
              />
            ))}
          </ScrollView>

          <Button
            title={loading ? 'Generating…' : 'Generate Rizz 🔥'}
            onPress={generate}
            loading={loading}
            style={{ marginTop: 16 }}
          />

          {/* Loading placeholder */}
          {loading ? (
            <View style={[styles.loadingBox, { marginTop: 22 }]}>
              <ActivityIndicator color={colors.electricBlue} />
              <Text style={{ color: colors.textMuted, marginTop: 10 }}>
                Rizz is thinking…
              </Text>
            </View>
          ) : null}

          {/* Responses */}
          {responses.length ? (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.label, { color: colors.textMuted, marginBottom: 8 }]}>
                TRY ONE OF THESE
              </Text>
              {responses.map((r, i) => (
                <RizzResponseCard
                  key={i}
                  index={i}
                  text={r}
                  style={style}
                  onSendToChat={sendToChat}
                />
              ))}

              <Text style={[styles.label, { color: colors.textMuted, marginTop: 18, marginBottom: 8 }]}>
                REFINE
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                {TONE_OPTIONS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => refine(t)}
                    disabled={refining}
                    style={[
                      styles.toneChip,
                      { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.pill },
                    ]}
                  >
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>
                      {refining ? '…' : t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={regenerate}
                disabled={loading}
                style={[
                  styles.regen,
                  { borderColor: colors.border, borderRadius: radius.md, marginTop: 18 },
                ]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>🔄 Regenerate</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 6 },
  input: {
    minHeight: 90,
    padding: 14,
    borderWidth: 1,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  loadingBox: { alignItems: 'center', padding: 24 },
  toneChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  regen: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});