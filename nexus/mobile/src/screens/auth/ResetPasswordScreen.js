import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordScreen({ route }) {
  const { resetToken } = route.params || {};
  const { colors, spacing } = useTheme();
  const { persistSession } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const valid = useMemo(() => {
    if (password.length < 8) return 'At least 8 characters.';
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Include letters and numbers.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  }, [password, confirm]);

  async function submit() {
    if (valid) return setError(valid);
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.resetPassword(resetToken, password);
      await persistSession(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not update password.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ padding: spacing.xl, flex: 1, justifyContent: 'center' }}>
          <AuthHeader showBack={false} title="Set a new password"
            subtitle="Choose something you'll remember." />

          <AuthInput label="New password" secureTextEntry value={password} onChangeText={setPassword} />
          <AuthInput label="Confirm new password" secureTextEntry value={confirm} onChangeText={setConfirm} />

          {error ? <Text style={{ color: colors.danger, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}

          <Button title="Update password" onPress={submit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });