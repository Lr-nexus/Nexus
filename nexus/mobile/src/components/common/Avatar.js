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

function bust(uri) {
  if (!uri) return uri;
  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}t=${Math.floor(Date.now() / 60000)}`;
}

export default function Avatar({
  uri,
  name = '',
  size = 44,
  onPress,
  ring = false,
  ringColor,
  style,
  cacheBust = true,
}) {
  const { colors } = useTheme();
  const initials = initialsOf(name);
  const Wrapper = onPress ? TouchableOpacity : View;
  const finalUri = uri ? (cacheBust ? bust(uri) : uri) : null;

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
      {finalUri ? (
        <Image
          source={{ uri: finalUri }}
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