import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import { COMPANY, TAGLINE } from '../../constants/config';
import { fontScale, moderateScale } from '../../theme/responsive';

export default function WelcomeScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={['rgba(37,99,235,0.18)', 'rgba(124,58,237,0.10)', 'transparent']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.wrap,
          { opacity: fade, transform: [{ scale }], paddingHorizontal: spacing.xl },
        ]}
      >
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoText}>N</Text>
          </LinearGradient>
        </View>

        <Text style={[styles.title, { color: colors.text, fontSize: fontScale(38) }]}>NOVA</Text>
        <Text style={[styles.byline, { color: colors.textDim, fontSize: fontScale(11) }]}>
          BY {COMPANY.toUpperCase()}
        </Text>
        <Text style={[styles.tag, { color: colors.textMuted, fontSize: fontScale(14) }]}>
          {TAGLINE}
        </Text>
      </Animated.View>

      <View style={[styles.actions, { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }]}>
        <Button
          title="Create Account"
          onPress={() => navigation.navigate(ROUTES.REGISTER)}
        />
        <View style={{ height: spacing.md }} />
        <Button
          title="Log In"
          variant="secondary"
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ONBOARDING)}
          style={styles.skip}
        >
          <Text style={{ color: colors.textMuted, fontSize: fontScale(13) }}>
            What is Nova? ·{' '}
            <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Learn more</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { marginBottom: moderateScale(24) },
  logo: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: moderateScale(52),
    fontWeight: '900',
    letterSpacing: -2,
    includeFontPadding: false,
  },
  title: { fontWeight: '900', letterSpacing: 8, includeFontPadding: false },
  byline: { letterSpacing: 3, marginTop: 6 },
  tag: { marginTop: 14, letterSpacing: 0.5, textAlign: 'center' },
  actions: { paddingTop: 8 },
  skip: { marginTop: 20, alignSelf: 'center', paddingVertical: 8 },
});