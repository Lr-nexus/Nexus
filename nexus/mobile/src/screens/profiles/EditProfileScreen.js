import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { uploadService } from '../../services/upload.service';
import { pickImage } from '../../utils/media';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

export default function EditProfileScreen() {
  const { colors, spacing } = useTheme();
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [isPrivate, setIsPrivate] = useState(!!user?.isPrivate);
  const [avatarUri, setAvatarUri] = useState(user?.profilePicture || '');
  const [busy, setBusy] = useState(false);

  async function changeAvatar() {
    const a = await pickImage({ allowsEditing: true, quality: 0.85, aspect: [1, 1] });
    if (!a) return;
    setBusy(true);
    try {
      const up = await uploadService.uploadImage(a.uri);
      setAvatarUri(up.url);
    } catch (e) { Alert.alert('Upload failed', e.message); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true);
    try {
      await usersApi.updateMe({
        fullName: fullName.trim(),
        bio: bio.trim(),
        website: website.trim(),
        isPrivate,
        profilePicture: avatarUri,
      });
      await refreshUser();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e?.response?.data?.message || 'Try again.');
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Edit profile"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <TouchableOpacity onPress={changeAvatar} style={styles.avatarWrap} disabled={busy}>
          <Avatar uri={avatarUri} name={fullName} size={96} />
          <Text style={{ color: colors.electricBlue, marginTop: 8, fontWeight: '700' }}>
            Change photo
          </Text>
          {busy ? <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 6 }} /> : null}
        </TouchableOpacity>

        <Input label="Full name" value={fullName} onChangeText={setFullName} />
        <Input label="Username" value={user?.username || ''} editable={false} helper="Username cannot be changed" />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} maxLength={200} />
        <Input label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" keyboardType="url" />

        <TouchableOpacity
          onPress={() => setIsPrivate((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {isPrivate ? '🔒 Private account' : '🌍 Public account'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <Button title={busy ? 'Saving…' : 'Save changes'} onPress={save} loading={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
});