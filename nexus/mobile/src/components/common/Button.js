import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale, fontScale } from '../../theme/responsive';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const { colors, radius, spacing } = useTheme();

  const bgMap = {
    primary: colors.nexusBlue,
    secondary: colors.card,
    ghost: 'transparent',
    danger: colors.danger,
    success: colors.success,
  };
  const borderMap = {
    primary: 'transparent',
    secondary: colors.border,
    ghost: colors.border,
    danger: 'transparent',
    success: 'transparent',
  };
  const textColorMap = {
    primary: '#FFFFFF',
    secondary: colors.text,
    ghost: colors.text,
    danger: '#FFFFFF',
    success: '#FFFFFF',
  };

  const heightMap = { sm: 44, md: 52, lg: 58 };
  const fontSizeMap = { sm: 14, md: 15, lg: 17 };

  const backgroundColor = bgMap[variant] || colors.nexusBlue;
  const borderColor = borderMap[variant] || 'transparent';
  const color = textColorMap[variant] || '#FFF';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderRadius: radius.md,
          height: moderateScale(heightMap[size]),
          paddingHorizontal: spacing.lg,
          opacity: disabled ? 0.55 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.row}>
          {icon ? <View style={styles.iconLeft}>{icon}</View> : null}
          <Text
            numberOfLines={1}
            style={[
              styles.txt,
              {
                color,
                fontSize: fontScale(fontSizeMap[size]),
                lineHeight: fontScale(fontSizeMap[size]) + 2,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight ? <View style={styles.iconRight}>{iconRight}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  txt: {
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  iconLeft: { marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  iconRight: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
});