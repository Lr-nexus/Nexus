import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { useTheme } from '../../context/ThemeContext';
import { permissions } from '../../utils/permissions';
import { formatDuration } from '../../utils/formatFileSize';

export default function VoiceRecorder({ visible, onClose, onSend }) {
  const { colors, radius } = useTheme();
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    const startRecording = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Microphone permission needed');
          onClose?.();
          return;
        }

        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setSeconds(0);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } catch (e) {
        Alert.alert('Could not start recording', e.message);
        onClose?.();
      }
    };

    startRecording();

    return () => {
      isMounted = false;
      clearInterval(timerRef.current);
    };
  }, [visible, audioRecorder, onClose]);

  async function stopAndGetUri() {
    if (!audioRecorder.isRecording) return null;
    try {
      await audioRecorder.stop();
      return audioRecorder.uri;
    } catch (e) {
      return null;
    }
  }

  async function cancel() {
    clearInterval(timerRef.current);
    await stopAndGetUri();
    onClose?.();
  }

  async function send() {
    clearInterval(timerRef.current);
    const uri = await stopAndGetUri();
    if (!uri) {
      onClose?.();
      return;
    }
    onSend?.({ uri, durationSeconds: seconds });
    onClose?.();
  }

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.overlay }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24 },
        ]}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
          Recording voice message
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 22, fontWeight: '800' }}>
          {formatDuration(seconds)}
        </Text>

        <View style={styles.wave}>
          {Array.from({ length: 22 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 3,
                height: 6 + ((i * 13) % 26),
                backgroundColor: colors.electricBlue,
                borderRadius: 2,
              }}
            />
          ))}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={cancel}
            style={[styles.btn, { backgroundColor: colors.card, flex: 1 }]}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={send}
            style={[styles.btn, { backgroundColor: colors.nexusBlue, flex: 1 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 },
  card: { width: '100%', maxWidth: 380, alignItems: 'center' },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginVertical: 22,
    height: 34,
  },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 6 },
  btn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});