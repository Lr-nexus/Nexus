import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Avatar({
  uri,
  name = '',
  size = 44,
  onPress,
  ring = false,
  ringColor,
  style,
}) {
  const { colors, radius } = useTheme();
  const initials = initialsOf(name);
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          width: size + (ring ? 4 : 0),
          height: size + (ring ? 4 : 0),
          borderRadius: (size + (ring ? 4 : 0)) / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 2 : 0,
          borderColor: ringColor || colors.electricBlue,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.purple,
            },
          ]}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>
            {initials || '?'}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});