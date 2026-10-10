import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { callsApi } from '../../api/calls.api';
import Avatar from '../../components/common/Avatar';

export default function CallScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { on } = useSocket();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversation, type = 'audio', incoming, participantIds } = route.params || {};

  const peers = (conversation?.participants || []).filter(
    (p) => String(p._id) !== String(user?.id)
  );
  const peer = peers[0] || { fullName: 'Unknown' };

  const targetIds = (participantIds && participantIds.length ? participantIds : peers.map((p) => String(p._id)))
    .filter((id) => id && id !== String(user?.id));

  const [callId, setCallId] = useState(incoming?.callId || null);
  const [status, setStatus] = useState(incoming ? 'incoming' : 'dialing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(type === 'video');
  const [cameraOn, setCameraOn] = useState(type === 'video');

  const start = useCallback(async () => {
    if (incoming) return;
    if (targetIds.length === 0) {
      Alert.alert('No participants', 'This conversation has no other members.');
      navigation.goBack();
      return;
    }
    try {
      const res = await callsApi.initiate(targetIds, type, conversation?._id || null);
      setCallId(res.call._id);
      setStatus('ringing');
    } catch (e) {
      Alert.alert('Call failed', e?.response?.data?.message || 'Try again.');
      navigation.goBack();
    }
  }, [incoming, targetIds, type, conversation, navigation]);

  useEffect(() => { start(); }, [start]);

  useEffect(() => {
    if (status !== 'connected') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    const offAccepted = on('call:accepted', ({ callId: id }) => {
      if (id === callId) setStatus('connected');
    });
    const offRejected = on('call:rejected', ({ callId: id }) => {
      if (id === callId) { setStatus('ended'); setTimeout(() => navigation.goBack(), 700); }
    });
    const offEnded = on('call:ended', ({ callId: id }) => {
      if (id === callId) { setStatus('ended'); setTimeout(() => navigation.goBack(), 700); }
    });
    return () => { offAccepted?.(); offRejected?.(); offEnded?.(); };
  }, [callId, on, navigation]);

  async function accept() {
    try { await callsApi.answer(callId, true); setStatus('connected'); }
    catch (e) { Alert.alert('Could not accept', e?.response?.data?.message || 'Try again.'); }
  }

  async function reject() {
    try { await callsApi.answer(callId, false); } catch {}
    navigation.goBack();
  }

  async function end() {
    try { if (callId) await callsApi.end(callId); } catch {}
    navigation.goBack();
  }

  function mmss(n) {
    const m = String(Math.floor(n / 60)).padStart(2, '0');
    const s = String(n % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#050810' }]} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 2 }}>
          {type === 'video' ? 'VIDEO CALL' : 'VOICE CALL'}
        </Text>
      </View>

      <View style={styles.center}>
        <Avatar uri={peer.profilePicture} name={peer.fullName} size={120} ring ringColor="#38BDF8" />
        <Text style={styles.name}>{peer.fullName}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
          {status === 'incoming'
            ? 'Incoming…'
            : status === 'dialing' || status === 'ringing'
            ? 'Ringing…'
            : status === 'connected'
            ? mmss(seconds)
            : 'Call ended'}
        </Text>

        {status === 'ringing' || status === 'dialing' ? (
          <ActivityIndicator color="#38BDF8" style={{ marginTop: 24 }} />
        ) : null}
      </View>

      {status === 'incoming' ? (
        <View style={styles.incomingControls}>
          <TouchableOpacity onPress={reject} style={[styles.bigBtn, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={accept} style={[styles.bigBtn, { backgroundColor: '#10B981' }]}>
            <Ionicons name="call" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.controls}>
          <ControlBtn icon={muted ? 'mic-off' : 'mic'} active={muted} onPress={() => setMuted((v) => !v)} label="Mute" />
          <ControlBtn icon={speaker ? 'volume-high' : 'volume-mute'} active={speaker} onPress={() => setSpeaker((v) => !v)} label="Speaker" />
          {type === 'video' ? (
            <ControlBtn icon={cameraOn ? 'videocam' : 'videocam-off'} active={!cameraOn} onPress={() => setCameraOn((v) => !v)} label="Camera" />
          ) : null}

          <View style={{ height: 22 }} />

          <TouchableOpacity onPress={end} style={[styles.bigBtn, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function ControlBtn({ icon, active, onPress, label }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: active ? '#2563EB' : 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
      }}
    >
      <Ionicons name={icon} size={26} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { alignItems: 'center', paddingVertical: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 18 },
  incomingControls: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 60, paddingBottom: 60,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bigBtn: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
  },
});