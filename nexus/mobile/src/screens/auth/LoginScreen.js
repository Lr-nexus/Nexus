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
import { useAuth } from '../../context/AuthContext';
import { validators } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';

export default function LoginScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const { persistSession } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setError(null);
    const value = identifier.trim();
    if (!validators.identifier(value)) return setError('Enter a valid email or phone number.');
    if (!password) return setError('Password is required.');

    setLoading(true);
    try {
      const data = await authApi.login(value, password);
      await persistSession(data);
    } catch (e) {
      const body = e?.response?.data;
      if (body?.needsVerification) {
        navigation.navigate(ROUTES.VERIFY_OTP, {
          identifier: body.identifier,
          purpose: body.purpose || 'REGISTRATION',
        });
        return;
      }
      setError(body?.message || 'Could not log in.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ padding: spacing.xl, flex: 1, justifyContent: 'center' }}>
          <AuthHeader onBack={() => navigation.goBack()} title="Welcome back 👋"
            subtitle="Log in with your email or phone and password." />

          <AuthInput label="Email or phone number" placeholder="you@gmail.com or +234..."
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            value={identifier} onChangeText={(v) => { setIdentifier(v); if (error) setError(null); }}
            returnKeyType="next" />

          <AuthInput label="Password" placeholder="Your password" secureTextEntry showPasswordToggle
            value={password} onChangeText={(v) => { setPassword(v); if (error) setError(null); }}
            onSubmitEditing={submit} returnKeyType="go" />

          {error ? (
            <Text style={{ color: colors.danger, fontSize: 13, marginBottom: 10 }}>{error}</Text>
          ) : null}

          <Button title="Log in" onPress={submit} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ACCOUNT_RECOVERY)}
            style={{ marginTop: 18, alignSelf: 'center' }}>
            <Text style={{ color: colors.electricBlue, fontWeight: '700', fontSize: 13 }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}
            style={{ marginTop: 12, alignSelf: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Don't have an account?{' '}
              <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });