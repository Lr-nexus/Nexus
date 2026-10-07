import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../../context/ThemeContext';

export default function OfflineBanner() {
  const { colors } = useTheme();
  const [offline, setOffline] = useState(false);
  const slide = React.useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
      Animated.timing(slide, {
        toValue: isOffline ? 0 : -40,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
    return () => unsub();
  }, [slide]);

  if (!offline) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { backgroundColor: colors.warning, transform: [{ translateY: slide }] },
      ]}
    >
      <Text style={styles.text}>You're offline. Some features may be unavailable.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#111827', fontSize: 12, fontWeight: '700' },
});