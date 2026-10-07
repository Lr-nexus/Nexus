import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
  circle = false,
}) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor: colors.card,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ count = 3, gap = 12 }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={72} radius={14} />
      ))}
    </View>
  );
}

export function SkeletonPost() {
  const { spacing } = useTheme();
  return (
    <View style={[styles.post, { padding: spacing.lg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={44} height={44} circle />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="55%" height={12} />
          <Skeleton width="35%" height={10} />
        </View>
      </View>
      <Skeleton height={180} radius={14} style={{ marginTop: 14 }} />
      <Skeleton width="80%" height={12} style={{ marginTop: 14 }} />
      <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  post: { gap: 4 },
});