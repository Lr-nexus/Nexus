import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Loader({ text = '', size = 'large', inline = false }) {
  const { colors, spacing } = useTheme();

  if (inline) {
    return <ActivityIndicator color={colors.electricBlue} size={size} />;
  }

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.electricBlue} size={size} />
      {text ? (
        <Text style={[styles.text, { color: colors.textMuted, marginTop: spacing.md }]}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { fontSize: 14 },
});