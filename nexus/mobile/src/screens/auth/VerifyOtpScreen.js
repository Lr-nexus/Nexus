import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthHeader from '../../components/auth/AuthHeader';
import OtpInput from '../../components/auth/OtpInput';
import OtpTimer from '../../components/auth/OtpTimer';
import Button from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { validators } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from '../../constants/config';

export default function VerifyOtpScreen({ route, navigation }) {
  const { identifier, purpose = 'REGISTRATION', resetToken } = route.params || {};
  const { colors, spacing } = useTheme();
  const { persistSession } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (!identifier) navigation.replace(ROUTES.LOGIN); }, [identifier, navigation]);

  async function verify() {
    setError(null);
    if (!validators.otp(otp, OTP_LENGTH)) return setError(`Enter the ${OTP_LENGTH}-digit code.`);
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(identifier, otp, purpose);

      if (purpose === 'ACCOUNT_RECOVERY' && data.resetToken) {
        navigation.replace(ROUTES.RESET_PASSWORD, { resetToken: data.resetToken });
        return;
      }

      // REGISTRATION or LOGIN: auto-auth
      await persistSession(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid or expired code.');
    } finally { setLoading(false); }
  }

  async function resend() {
    setResending(true); setOtp('');
    try {
      await authApi.resendOtp(identifier, purpose);
      Alert.alert('Code sent', `We sent a new code to ${identifier}.`);
    } catch (e) {
      Alert.alert('Could not resend', e?.response?.data?.message || 'Try again.');
    } finally { setResending(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ padding: spacing.xl, flex: 1 }}>
          <AuthHeader onBack={() => navigation.goBack()}
            title={purpose === 'ACCOUNT_RECOVERY' ? 'Recover your account' : 'Verify your email'}
            subtitle={`We sent a ${OTP_LENGTH}-digit code to ${identifier || ''}.`} />

          <OtpInput value={otp} onChange={setOtp} length={OTP_LENGTH} />

          {error ? (
            <Text style={{ color: colors.danger, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
          ) : null}

          <Button title="Verify" onPress={verify} loading={loading} disabled={otp.length !== OTP_LENGTH} />

          <OtpTimer seconds={RESEND_COOLDOWN_SECONDS} onResend={resend} resending={resending} />

          <TouchableOpacity onPress={() => navigation.goBack()}
            style={{ marginTop: 'auto', alignSelf: 'center', paddingBottom: 12 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              Wrong email? <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Change</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });