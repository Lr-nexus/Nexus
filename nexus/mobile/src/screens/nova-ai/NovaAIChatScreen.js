import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { novaAIApi } from '../../api/novaAI.api';
import Header from '../../components/common/Header';

export default function NovaAIChatScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { preset } = route.params || {};

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        preset === 'summarize'
          ? 'Paste any text and I will summarize it in 3-5 bullets.'
          : preset === 'captions'
          ? 'Give me a topic or an image description — I will write captions.'
          : preset === 'translate'
          ? 'Tell me the target language and the text. I will translate it.'
          : 'Hi! I am Nova AI. Ask me anything — brainstorming, writing, summarizing, or general questions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 40);

    try {
      const res = preset === 'summarize'
        ? await novaAIApi.summarize(text)
        : await novaAIApi.chat(text);
      const reply = res.reply || res.summary || '(no response)';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Nova AI is temporarily unavailable.';
      setMessages((m) => [...m, { role: 'assistant', content: `😕 ${msg}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 40);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Nova AI"
        subtitle="Powered by Gemini"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
  enabled
>
        <ScrollView
          ref={ref}
          contentContainerStyle={{ padding: spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.role === 'user'
                  ? { alignSelf: 'flex-end', backgroundColor: colors.nexusBlue, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: 4 }
                  : { alignSelf: 'flex-start', backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderBottomRightRadius: radius.lg, borderBottomLeftRadius: 4 },
              ]}
            >
              <Text style={{ color: m.role === 'user' ? '#fff' : colors.text, lineHeight: 21 }}>
                {m.content}
              </Text>
            </View>
          ))}
          {loading ? (
            <View style={[styles.typing, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
              <ActivityIndicator color={colors.electricBlue} size="small" />
              <Text style={{ color: colors.textMuted, marginLeft: 8 }}>Thinking…</Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={preset === 'summarize' ? 'Paste text to summarize…' : 'Ask anything…'}
            placeholderTextColor={colors.textDim}
            multiline
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.bg, borderRadius: radius.pill },
            ]}
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim() || loading}
            style={[
              styles.send,
              {
                backgroundColor: input.trim() ? colors.nexusBlue : colors.card,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ color: input.trim() ? '#fff' : colors.textDim, fontWeight: '800' }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, marginVertical: 4 },
  typing: { flexDirection: 'row', alignItems: 'center', padding: 12, alignSelf: 'flex-start' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  send: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});