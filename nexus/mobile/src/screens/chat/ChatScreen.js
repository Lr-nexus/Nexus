import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { conversationsApi } from '../../api/conversations.api';
import { messagesApi } from '../../api/messages.api';
import { uploadService } from '../../services/upload.service';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import MessageActions from '../../components/chat/MessageActions';
import VoiceRecorder from '../../components/chat/VoiceRecorder';
import BottomSheet from '../../components/common/BottomSheet';
import { ROUTES } from '../../constants/routes';
import { pickImage, pickVideo } from '../../utils/media';

export default function ChatScreen({ route }) {
  const { conversation: initial } = route.params || {};
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const { socket, emit, on, connected } = useSocket();
  const navigation = useNavigation();

  const [conversation] = useState(initial);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [actionsFor, setActionsFor] = useState(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const load = useCallback(async () => {
    if (!conversation?._id) return;
    setLoading(true);
    try {
      const res = await conversationsApi.messages(conversation._id, { limit: 50 });
      setMessages(res.messages || []);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    } catch (e) {
      Alert.alert('Could not load messages', e?.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  }, [conversation]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!conversation?._id) return;
    emit('conversation:join', conversation._id);
    return () => emit('conversation:leave', conversation._id);
  }, [conversation, emit]);

  useEffect(() => {
    if (!conversation?._id) return;

    const offNew = on('message:new', (m) => {
      if (m.conversationId !== conversation._id) return;
      setMessages((prev) => {
        if (prev.find((x) => x._id === m._id)) return prev;
        return [...prev, m];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    });

    const offTyping = on('message:typing', (payload) => {
      if (payload.conversationId !== conversation._id) return;
      if (payload.userId === user?.id) return;
      setTyping(!!payload.isTyping);
    });

    const offReaction = on('message:reaction', ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    const offRead = on('message:read', ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, readBy: [...(m.readBy || []), userId] }
            : m
        )
      );
    });

    return () => {
      offNew?.();
      offTyping?.();
      offReaction?.();
      offRead?.();
    };
  }, [conversation, on, user?.id]);

  // typing emit with debounce
  const onInputTyping = useCallback(() => {
    if (!conversation?._id) return;
    emit('message:typing', { conversationId: conversation._id, isTyping: true });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emit('message:typing', { conversationId: conversation._id, isTyping: false });
    }, 1600);
  }, [conversation, emit]);

  async function sendText(text) {
    if (!text.trim()) return;
    setSending(true);
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      conversationId: conversation._id,
      senderId: user?.id,
      type: 'text',
      content: text,
      createdAt: new Date().toISOString(),
      __optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);

    try {
      const res = await conversationsApi.send(conversation._id, {
        content: text,
        type: 'text',
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? res.message : m))
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === optimistic._id ? { ...m, __failed: true } : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  async function sendMedia(kind) {
    try {
      let asset;
      if (kind === 'image') asset = await pickImage({ allowsEditing: false, quality: 0.85 });
      else asset = await pickVideo();
      if (!asset) return;

      setSending(true);
      const up =
        kind === 'image'
          ? await uploadService.uploadImage(asset.uri)
          : await uploadService.uploadVideo(asset.uri);

      const res = await conversationsApi.send(conversation._id, {
        content: '',
        type: kind,
        media: { url: up.url, publicId: up.publicId, mimeType: asset.mimeType || kind },
      });
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    } catch (e) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setSending(false);
    }
  }

  async function sendVoice({ uri, durationSeconds }) {
    try {
      setSending(true);
      const up = await uploadService.uploadAudio(uri);
      const res = await conversationsApi.send(conversation._id, {
        content: '',
        type: 'audio',
        media: { url: up.url, publicId: up.publicId, mimeType: 'audio/m4a' },
      });
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    } catch (e) {
      Alert.alert('Send failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleMessageAction(kind, payload) {
    const m = actionsFor;
    if (!m) return;
    try {
      if (kind === 'react') {
        await messagesApi.react(m._id, payload);
      } else if (kind === 'delete') {
        await messagesApi.remove(m._id);
        setMessages((prev) =>
          prev.map((x) => (x._id === m._id ? { ...x, isDeleted: true, content: '' } : x))
        );
      } else if (kind === 'edit') {
        // simple prompt-style edit — native Alert prompt
        Alert.prompt?.(
          'Edit message',
          '',
          async (value) => {
            if (!value) return;
            const res = await messagesApi.edit(m._id, value);
            setMessages((prev) => prev.map((x) => (x._id === m._id ? res.message : x)));
          },
          'plain-text',
          m.content || ''
        );
      } else if (kind === 'forward') {
        Alert.alert('Forward', 'Select a chat to forward to (coming next).');
      } else if (kind === 'copy') {
        // clipboard — optional dependency; graceful no-op
        try {
          const Clipboard = require('expo-clipboard');
          await Clipboard.setStringAsync(m.content || '');
        } catch {}
      }
    } catch (e) {
      Alert.alert('Action failed', e?.response?.data?.message || 'Try again.');
    }
  }

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ChatHeader
        conversation={conversation}
        currentUserId={user?.id}
        onBack={() => navigation.goBack()}
        onInfo={() => navigation.navigate(ROUTES.CHAT_INFO, { conversation })}
        onCall={() => navigation.navigate(ROUTES.CALL, { conversation, type: 'audio' })}
        onVideo={() => navigation.navigate(ROUTES.CALL, { conversation, type: 'video' })}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.electricBlue} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                mine={item.senderId === user?.id || item.senderId?._id === user?.id}
                onLongPress={(m) => setActionsFor(m)}
              />
            )}
            contentContainerStyle={{ paddingVertical: 10 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {typing ? (
          <Text style={[styles.typing, { color: colors.textMuted }]}>typing…</Text>
        ) : null}

        <ChatInput
          ref={inputRef}
          sending={sending}
          onSend={sendText}
          onAttach={() => setAttachOpen(true)}
          onRizz={() =>
            navigation.navigate(ROUTES.RIZZ_CHAT, {
              mode: 'reply',
              context: messages.slice(-3).map((m) => m.content).filter(Boolean).join('\n'),
              conversationId: conversation._id,
            })
          }
          onVoicePress={() => setVoiceOpen(true)}
        />
      </KeyboardAvoidingView>

      <MessageActions
        visible={!!actionsFor}
        message={actionsFor}
        mine={
          actionsFor?.senderId === user?.id || actionsFor?.senderId?._id === user?.id
        }
        onClose={() => setActionsFor(null)}
        onAction={handleMessageAction}
      />

      <BottomSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        title="Attach"
        items={[
          { label: '📷 Photo', onPress: () => sendMedia('image') },
          { label: '🎬 Video', onPress: () => sendMedia('video') },
          { label: '📄 Document', onPress: () => Alert.alert('Documents', 'Coming next.') },
          { label: '📍 Location', onPress: () => Alert.alert('Location', 'Coming next.') },
          { label: '👤 Contact', onPress: () => Alert.alert('Contact', 'Coming next.') },
          { label: '🎙️ Voice message', onPress: () => setVoiceOpen(true) },
        ]}
      />

      <VoiceRecorder
        visible={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSend={sendVoice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  typing: {
    fontSize: 11,
    paddingHorizontal: 14,
    paddingBottom: 4,
    fontStyle: 'italic',
  },
});