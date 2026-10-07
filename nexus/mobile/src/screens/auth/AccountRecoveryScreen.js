import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { validators } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';

export default function AccountRecoveryScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function recover() {
    setError(null);
    const value = identifier.trim();
    if (!validators.identifier(value)) return setError('Enter the email or phone on your account.');

    setLoading(true);
    try {
      await authApi.requestOtp(value, 'ACCOUNT_RECOVERY');
      navigation.navigate(ROUTES.VERIFY_OTP, { identifier: value, purpose: 'ACCOUNT_RECOVERY' });
    } catch (e) {
      Alert.alert('Could not start recovery', e?.response?.data?.message || 'Try again.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ padding: spacing.xl, flex: 1, justifyContent: 'center' }}>
          <AuthHeader onBack={() => navigation.goBack()} title="Forgot password?"
            subtitle="We'll verify you by email OTP, then you can set a new password." />

          <AuthInput label="Email or phone number" placeholder="you@gmail.com or +234..."
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            value={identifier} onChangeText={(v) => { setIdentifier(v); if (error) setError(null); }}
            error={error} onSubmitEditing={recover} returnKeyType="go" />

          <Button title="Send recovery code" onPress={recover} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}
            style={{ marginTop: 24, alignSelf: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Back to <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });