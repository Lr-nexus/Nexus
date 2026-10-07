import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');

const SLIDES = [
  { key: 'chat', emoji: '💬', title: 'Messaging', body: 'Private chats, groups, communities and broadcast channels in one place.' },
  { key: 'stories', emoji: '✨', title: 'Stories', body: 'Share moments that disappear after 24 hours — photos, videos, text.' },
  { key: 'feed', emoji: '📸', title: 'Social feed', body: 'Post, follow, react and discover what your circle is creating.' },
  { key: 'vibes', emoji: '🔥', title: 'Vibes', body: 'Short vertical videos. Swipe, watch, react and go viral.' },
  { key: 'rizz', emoji: '🔥', title: 'Rizz AI', body: 'Your AI copilot for conversations. Powered by Google Gemini.' },
  { key: 'calls', emoji: '📞', title: 'Voice & video', body: 'Crystal clear 1:1 and group calls wherever you are.' },
  { key: 'privacy', emoji: '🔐', title: 'Privacy first', body: 'Passwordless login with OTP. You control what you share.' },
];

export default function OnboardingScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1 });
    } else {
      navigation.replace(ROUTES.WELCOME);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.replace(ROUTES.WELCOME)}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={ref}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, paddingHorizontal: spacing.xl }]}>
            <LinearGradient
              colors={['rgba(37,99,235,0.25)', 'rgba(124,58,237,0.10)']}
              style={styles.slideIconBg}
            >
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
            </LinearGradient>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.slideBody, { color: colors.textMuted }]}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.electricBlue : colors.border,
                width: i === index ? 22 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={{ padding: spacing.xl }}>
        <Button
          title={index === SLIDES.length - 1 ? "Let's go" : 'Next'}
          onPress={onNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  slide: { alignItems: 'center', justifyContent: 'center' },
  slideIconBg: {
    width: 140, height: 140, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  slideEmoji: { fontSize: 68 },
  slideTitle: { fontSize: 26, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  slideBody: { fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  dot: { height: 8, borderRadius: 4 },
});