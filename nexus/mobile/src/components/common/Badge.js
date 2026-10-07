import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Badge({
  label,
  variant = 'primary', // primary | success | danger | warning | neutral
  size = 'md',
  style,
}) {
  const { colors, radius } = useTheme();

  const bgMap = {
    primary: colors.nexusBlue,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    neutral: colors.card,
  };
  const textMap = {
    primary: '#fff',
    success: '#fff',
    danger: '#fff',
    warning: '#111',
    neutral: colors.text,
  };
  const sizeStyles = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    md: { paddingHorizontal: 8, paddingVertical: 3, fontSize: 11 },
    lg: { paddingHorizontal: 10, paddingVertical: 5, fontSize: 13 },
  }[size];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgMap[variant] || colors.nexusBlue,
          borderRadius: radius.pill,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: textMap[variant] || '#fff',
          fontSize: sizeStyles.fontSize,
          fontWeight: '800',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start' },
});