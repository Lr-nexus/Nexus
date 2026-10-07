import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { fontScale } from '../../theme/responsive';

export default function AuthHeader({ title, subtitle, onBack, showBack = true }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      {showBack ? (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.back}
        >
          <Text style={{ color: colors.text, fontSize: fontScale(26), lineHeight: fontScale(26) }}>‹</Text>
        </TouchableOpacity>
      ) : null}
      {title ? (
        <Text style={[styles.title, { color: colors.text, fontSize: fontScale(26) }]}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.sub, { color: colors.textMuted, fontSize: fontScale(14) }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  sub: { marginTop: 6, lineHeight: fontScale(20) },
});