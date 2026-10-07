import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function RizzStyleChip({ style, label, emoji, active, onPress }) {
  const { colors, radius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.nexusBlue : colors.card,
          borderColor: active ? colors.nexusBlue : colors.border,
          borderRadius: radius.pill,
        },
      ]}
    >
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text
        style={{
          color: active ? '#fff' : colors.text,
          fontWeight: '700',
          fontSize: 12,
          marginLeft: 4,
          textTransform: 'capitalize',
        }}
      >
        {label || style}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
});