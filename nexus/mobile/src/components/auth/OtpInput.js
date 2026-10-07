import React, { useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function OtpInput({
  value = '',
  onChange,
  length = 6,
  autoFocus = true,
  editable = true,
}) {
  const { colors, radius } = useTheme();
  const refs = useRef([]);
  const digits = value.split('');

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => refs.current[0]?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const handleChange = (index, text) => {
    const clean = text.replace(/\D/g, '');
    const next = [...digits];
    if (clean.length > 1) {
      // paste support
      const chars = clean.slice(0, length - index).split('');
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      onChange(next.join('').slice(0, length));
      const focusIdx = Math.min(index + chars.length, length - 1);
      refs.current[focusIdx]?.focus();
      return;
    }
    next[index] = clean;
    onChange(next.join('').slice(0, length));
    if (clean && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKey = (index, { nativeEvent }) => {
    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => (refs.current[i] = r)}
          value={digits[i] || ''}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={(e) => handleKey(i, e)}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={length}
          editable={editable}
          selectTextOnFocus
          style={[
            styles.cell,
            {
              backgroundColor: colors.surface,
              borderColor: digits[i] ? colors.electricBlue : colors.border,
              color: colors.text,
              borderRadius: radius.md,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 22,
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 58,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
  },
});