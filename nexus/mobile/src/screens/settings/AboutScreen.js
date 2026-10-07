import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import { COMPANY } from '../../constants/config';

export default function AboutScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="About"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, alignItems: 'center' }}>
        <LinearGradient
          colors={['#2563EB', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Text style={styles.logoText}>N</Text>
        </LinearGradient>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 6, marginTop: 16 }}>
          NOVA
        </Text>
        <Text style={{ color: colors.textDim, marginTop: 4, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>
          by {COMPANY}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>
          Connect. Chat. Share. Discover.
        </Text>
        <Text style={{ color: colors.textDim, marginTop: 8, fontSize: 12 }}>v1.0.0</Text>

        <View style={{ marginTop: 40, width: '100%' }}>
          <Row label="Help & support" onPress={() => Linking.openURL('mailto:support@nexus.app')} />
          <Row label="Terms of service" onPress={() => Linking.openURL('https://nexus.app/terms')} />
          <Row label="Privacy policy" onPress={() => Linking.openURL('https://nexus.app/privacy')} />
          <Row label="Powered by Google Gemini" noChevron />
          <Row label="Passwordless email OTP auth" noChevron />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, onPress, noChevron }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        marginBottom: 8,
      }}
    >
      <Text
        onPress={onPress}
        style={{ color: onPress ? colors.text : colors.textMuted, fontWeight: '600', flex: 1 }}
      >
        {label}
      </Text>
      {!noChevron && onPress ? <Text style={{ color: colors.textMuted }}>›</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  logo: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 44, fontWeight: '900' },
});