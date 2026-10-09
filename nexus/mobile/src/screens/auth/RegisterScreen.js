import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { getRegisterErrors } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';

export default function RegisterScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '',
    dateOfBirth: '2000-01-01', password: '', confirmPassword: '',
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const errors = useMemo(() => {
    const e = getRegisterErrors(form);
    if (form.password.length < 8) e.password = 'At least 8 characters.';
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = 'Include letters and numbers.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  }, [form]);

  const showError = (k) => (touched[k] ? errors[k] : null);
  const canSubmit = Object.keys(errors).length === 0;

  async function submit() {
    setTouched({
      fullName: true, username: true, email: true, phone: true,
      dateOfBirth: true, password: true, confirmPassword: true,
    });
    if (!canSubmit) return;

    setLoading(true);
    try {
      await authApi.register({
        fullName: form.fullName,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth,
        password: form.password,
      });
      navigation.navigate(ROUTES.VERIFY_OTP, {
        identifier: form.email.trim().toLowerCase(),
        purpose: 'REGISTRATION',
      });
    } catch (e) {
      Alert.alert('Registration failed', e?.response?.data?.message || 'Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHeader onBack={() => navigation.goBack()} title="Create your Nova"
            subtitle="Set a password. We'll verify your email with a one-time code." />

          <AuthInput label="Full name" placeholder="Jane Doe" value={form.fullName}
            onChangeText={set('fullName')} onBlur={blur('fullName')} error={showError('fullName')} />
          <AuthInput label="Username" placeholder="jane_doe" autoCapitalize="none"
            value={form.username} onChangeText={set('username')} onBlur={blur('username')}
            error={showError('username')} helper="3–24 chars: a–z, 0–9, _ or ." />
          <AuthInput label="Email" placeholder="you@gmail.com" keyboardType="email-address"
            autoCapitalize="none" value={form.email} onChangeText={set('email')}
            onBlur={blur('email')} error={showError('email')} />
          <AuthInput label="Phone number" placeholder="+234 906 753 1056" keyboardType="phone-pad"
            value={form.phone} onChangeText={set('phone')} onBlur={blur('phone')} error={showError('phone')} />
          <AuthInput label="Date of birth" placeholder="YYYY-MM-DD" value={form.dateOfBirth}
            onChangeText={set('dateOfBirth')} onBlur={blur('dateOfBirth')}
            error={showError('dateOfBirth')} helper="You must be 13 or older." />
          <AuthInput label="Password" placeholder="At least 8 characters"
            secureTextEntry showPasswordToggle
            value={form.password} onChangeText={set('password')} onBlur={blur('password')}
            error={showError('password')} />
          <AuthInput label="Confirm password" placeholder="Repeat your password"
            secureTextEntry showPasswordToggle
            value={form.confirmPassword} onChangeText={set('confirmPassword')}
            onBlur={blur('confirmPassword')} error={showError('confirmPassword')} />

          <View style={{ height: 8 }} />
          <Button title="Create account" onPress={submit} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} style={{ marginTop: 22, alignSelf: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Already have an account?{' '}
              <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Log in</Text>
            </Text>
          </TouchableOpacity>

          <Text style={[styles.legal, { color: colors.textDim }]}>
            By continuing you agree to Nova's Terms & Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  legal: { fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 16 },
});