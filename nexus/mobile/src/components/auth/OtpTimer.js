import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function OtpTimer({
  seconds = 60,
  onResend,
  resending = false,
  disabled = false,
}) {
  const { colors } = useTheme();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const canResend = remaining <= 0 && !resending && !disabled;

  const handlePress = async () => {
    if (!canResend) return;
    setRemaining(seconds);
    await onResend?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!canResend}
      style={styles.wrap}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: canResend ? colors.electricBlue : colors.textMuted }]}>
        {resending
          ? 'Sending…'
          : remaining > 0
          ? `Resend available in ${remaining}s`
          : 'Resend code'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', paddingVertical: 14 },
  text: { fontSize: 14, fontWeight: '700' },
});