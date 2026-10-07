import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function CallControls({
  muted,
  speaker,
  cameraOn,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
  onSwitchCamera,
  onEnd,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Btn
          label="Mute"
          icon={muted ? '🔇' : '🎙️'}
          active={muted}
          onPress={onToggleMute}
        />
        <Btn
          label="Speaker"
          icon={speaker ? '🔊' : '🔈'}
          active={speaker}
          onPress={onToggleSpeaker}
        />
        {onToggleCamera ? (
          <Btn
            label={cameraOn ? 'Camera off' : 'Camera on'}
            icon={cameraOn ? '📹' : '📷'}
            active={!cameraOn}
            onPress={onToggleCamera}
          />
        ) : null}
        {onSwitchCamera ? (
          <Btn
            label="Flip"
            icon="🔄"
            onPress={onSwitchCamera}
          />
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onEnd}
        style={[styles.end, { backgroundColor: colors.danger }]}
      >
        <Text style={{ color: '#fff', fontSize: 20 }}>📵</Text>
      </TouchableOpacity>
    </View>
  );
}

function Btn({ icon, label, active, onPress }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        {
          backgroundColor: active ? colors.nexusBlue : 'rgba(255,255,255,0.12)',
        },
      ]}
      activeOpacity={0.85}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ color: '#fff', fontSize: 10, marginTop: 4, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  end: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});