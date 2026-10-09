import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, Keyboard, ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { conversationsApi } from '../../api/conversations.api';
import { messagesApi } from '../../api/messages.api';
import { uploadService } from '../../services/upload.service';
import { chatSettings } from '../../services/chatSettings.service';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import MessageActions from '../../components/chat/MessageActions';
import VoiceRecorder from '../../components/chat/VoiceRecorder';
import RizzInlinePanel from '../../components/chat/RizzInlinePanel';
import BottomSheet from '../../components/common/BottomSheet';
import { ROUTES } from '../../constants/routes';
import { pickImage, pickVideo, pickDocument } from '../../utils/media';

function dedupeMessages(list) {
  const seen = new Map();
  const result = [];
  for (const m of list) {
    const key = m._id || m.__optimistic;
    if (seen.has(key)) {
      const idx = seen.get(key);
      result[idx] = m;
    } else {
      seen.set(key, result.length);
      result.push(m);
    }
  }
  return result;
}

export default function ChatScreen({ route }) {
  const { conversation: initial } = route.params || {};
  const { colors } = useTheme();
  const { user } = useAuth();
  const { emit, on } = useSocket();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [conversation, setConversation] = useState(initial);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [actionsFor, setActionsFor] = useState(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [rizzOpen, setRizzOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);

  const listRef = useRef(null);
  const innerInputRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  const load = useCallback(async () => {
    if (!conversation?._id) return;
    setLoading(true);
    try {
      const [res, wp] = await Promise.all([
        conversationsApi.messages(conversation._id, { limit: 50 }),
        chatSettings.getWallpaper(conversation._id),
      ]);
      const clean = (res.messages || []).filter((m) => m._id);
      seenIdsRef.current = new Set(clean.map((m) => m._id));
      setMessages(clean);
      setWallpaper(wp);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    } catch (e) {
      Alert.alert('Could not load messages', e?.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  }, [conversation]);

  // Reload wallpaper when returning to this screen
  useFocusEffect(useCallback(() => {
    if (conversation?._id) {
      chatSettings.getWallpaper(conversation._id).then(setWallpaper);
    }
  }, [conversation?._id]));

  useEffect(() => { load(); }, [load]);

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
        let next;
        if (m.senderId === user?.id) {
          const idx = prev.findIndex((x) => x.__optimistic && x.content === m.content && x.type === m.type);
          if (idx >= 0) { next = [...prev]; next[idx] = m; }
          else if (!seenIdsRef.current.has(m._id)) next = [...prev, m];
          else return prev;
        } else if (!seenIdsRef.current.has(m._id)) {
          next = [...prev, m];
        } else return prev;
        seenIdsRef.current.add(m._id);
        return dedupeMessages(next);
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
        dedupeMessages(prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)))
      );
    });

    const offOnline = on('user:online', ({ userId }) => {
      setConversation((c) => !c ? c : {
        ...c,
        participants: c.participants.map((p) =>
          String(p._id) === String(userId) ? { ...p, isOnline: true } : p
        ),
      });
    });

    const offOffline = on('user:offline', ({ userId }) => {
      setConversation((c) => !c ? c : {
        ...c,
        participants: c.participants.map((p) =>
          String(p._id) === String(userId) ? { ...p, isOnline: false } : p
        ),
      });
    });

    return () => {
      offNew?.(); offTyping?.(); offReaction?.(); offOnline?.(); offOffline?.();
    };
  }, [conversation, on, user?.id]);

  async function sendText(text) {
    if (!text.trim()) return;
    setSending(true);
    const optimistic = {
      _id: `tmp-${Date.now()}-${Math.random()}`,
      __optimistic: true,
      conversationId: conversation._id,
      senderId: user?.id,
      type: 'text',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => dedupeMessages([...prev, optimistic]));
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);

    try {
      const res = await conversationsApi.send(conversation._id, { content: text, type: 'text' });
      seenIdsRef.current.add(res.message._id);
      setMessages((prev) =>
        dedupeMessages(prev.map((m) => (m._id === optimistic._id ? res.message : m)))
      );
    } catch {
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? { ...m, __failed: true } : m)));
    } finally { setSending(false); }
  }

  async function sendMedia(kind) {
    try {
      let asset;
      if (kind === 'image') asset = await pickImage({ allowsEditing: false, quality: 0.85 });
      else asset = await pickVideo();
      if (!asset) return;
      setSending(true);
      const up = kind === 'image'
        ? await uploadService.uploadImage(asset.uri)
        : await uploadService.uploadVideo(asset.uri);
      const res = await conversationsApi.send(conversation._id, {
        content: '',
        type: kind,
        media: { url: up.url, publicId: up.publicId, mimeType: asset.mimeType || kind },
      });
      seenIdsRef.current.add(res.message._id);
      setMessages((prev) => dedupeMessages([...prev, res.message]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    } catch (e) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Try again.');
    } finally { setSending(false); }
  }

  async function sendDocument() {
    try {
      const doc = await pickDocument();
      if (!doc) return;
      setSending(true);
      const up = await uploadService.uploadFile(doc.uri, doc.name, doc.mimeType);
      const res = await conversationsApi.send(conversation._id, {
        content: doc.name,
        type: 'file',
        media: { url: up.url, publicId: up.publicId, mimeType: doc.mimeType, name: doc.name },
      });
      seenIdsRef.current.add(res.message._id);
      setMessages((prev) => dedupeMessages([...prev, res.message]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    } catch (e) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Try again.');
    } finally { setSending(false); }
  }

  async function sendVoice({ uri }) {
    try {
      setSending(true);
      const up = await uploadService.uploadAudio(uri);
      const res = await conversationsApi.send(conversation._id, {
        content: '',
        type: 'audio',
        media: { url: up.url, publicId: up.publicId, mimeType: 'audio/m4a' },
      });
      seenIdsRef.current.add(res.message._id);
      setMessages((prev) => dedupeMessages([...prev, res.message]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
    } catch (e) {
      Alert.alert('Send failed', e?.response?.data?.message || 'Try again.');
    } finally { setSending(false); }
  }

  function startCall(type) {
    const ids = (conversation?.participants || [])
      .map((p) => String(p._id || p))
      .filter((id) => id !== String(user?.id));
    if (ids.length === 0) return Alert.alert('No participants to call.');
    Keyboard.dismiss();
    navigation.navigate(ROUTES.CALL, { conversation, type, participantIds: ids });
  }

  async function handleMessageAction(kind, payload) {
    const m = actionsFor;
    if (!m) return;
    try {
      if (kind === 'react') await messagesApi.react(m._id, payload);
      else if (kind === 'delete') {
        await messagesApi.remove(m._id);
        setMessages((prev) => prev.map((x) => (x._id === m._id ? { ...x, isDeleted: true, content: '' } : x)));
      } else if (kind === 'copy') {
        try { const C = require('expo-clipboard'); await C.setStringAsync(m.content || ''); } catch {}
      }
    } catch (e) {
      Alert.alert('Action failed', e?.response?.data?.message || 'Try again.');
    }
  }

  const recentContext = messages
    .filter((m) => m.content)
    .slice(-3)
    .map((m) => m.content)
    .join('\n');

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const listContent = (
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
      contentContainerStyle={{ paddingVertical: 10, paddingBottom: 8 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
    />
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ChatHeader
        conversation={conversation}
        currentUserId={user?.id}
        onBack={() => { Keyboard.dismiss(); navigation.goBack(); }}
        onInfo={() => navigation.navigate(ROUTES.CHAT_INFO, { conversation })}
        onCall={() => startCall('audio')}
        onVideo={() => startCall('video')}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
        enabled
      >
        {wallpaper ? (
          <ImageBackground
            source={{ uri: wallpaper }}
            style={{ flex: 1 }}
            imageStyle={{ opacity: 0.35 }}
          >
            {loading ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={colors.electricBlue} />
              </View>
            ) : listContent}
          </ImageBackground>
        ) : loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.electricBlue} />
          </View>
        ) : listContent}

        {typing ? (
          <Text style={[styles.typing, { color: colors.textMuted }]}>typing…</Text>
        ) : null}

        {rizzOpen ? (
          <RizzInlinePanel
            visible={rizzOpen}
            onClose={() => setRizzOpen(false)}
            recentContext={recentContext}
            onUseMessage={(text) => sendText(text)}
          />
        ) : (
          <ChatInput
            ref={innerInputRef}
            sending={sending}
            onSend={sendText}
            onAttach={() => setAttachOpen(true)}
            onRizz={() => { Keyboard.dismiss(); setRizzOpen(true); }}
            onVoicePress={() => setVoiceOpen(true)}
          />
        )}
      </KeyboardAvoidingView>

      <MessageActions
        visible={!!actionsFor}
        message={actionsFor}
        mine={actionsFor?.senderId === user?.id || actionsFor?.senderId?._id === user?.id}
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
          { label: '📄 Document', onPress: sendDocument },
          { label: '📍 Location', onPress: () => navigation.navigate(ROUTES.LOCATION_SHARE, { conversationId: conversation._id }) },
          { label: '👤 Contact', onPress: () => navigation.navigate(ROUTES.CONTACT_PICKER, { conversationId: conversation._id }) },
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
  typing: { fontSize: 11, paddingHorizontal: 14, paddingBottom: 4, fontStyle: 'italic' },
});