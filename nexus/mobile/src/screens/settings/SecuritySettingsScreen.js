import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

export default function SecuritySettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const { logout } = useAuth();

  function confirmLogoutAll() {
    Alert.alert(
      'Log out of all devices?',
      'You will need to verify with an email OTP on each device again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out all', style: 'destructive', onPress: logout },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Security"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Row
          icon="🔐"
          title="Passwordless login"
          subtitle="Nova uses email OTPs. There are no passwords."
        />
        <Row
          icon="📱"
          title="Login activity"
          subtitle="See devices currently signed in"
          onPress={() => navigation.navigate('LoginActivity')}
        />
        <Row icon="✉️" title="Email verified" subtitle="Verified at registration" />
        <Row icon="🛡️" title="Account status" subtitle="Active" />

        <View style={{ marginTop: 24 }}>
          <Button title="Log out of all devices" variant="danger" onPress={confirmLogoutAll} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, title, subtitle, onPress }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 20, width: 30 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      </View>
      {onPress ? (
        <Text onPress={onPress} style={{ color: colors.electricBlue, fontWeight: '700' }}>
          Manage
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });