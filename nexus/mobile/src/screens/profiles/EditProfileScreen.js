import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { uploadService } from '../../services/upload.service';
import { pickImage } from '../../utils/media';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';

export default function EditProfileScreen() {
  const { colors, spacing, radius } = useTheme();
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [isPrivate, setIsPrivate] = useState(!!user?.isPrivate);
  const [avatarUri, setAvatarUri] = useState(user?.profilePicture || '');
  const [busy, setBusy] = useState(false);

  async function changeAvatar() {
    try {
      const a = await pickImage({ allowsEditing: true, quality: 0.9, aspect: [1, 1] });
      if (!a) return;
      setBusy(true);
      const up = await uploadService.uploadImage(a.uri);
      setAvatarUri(up.url);
    } catch (e) {
      Alert.alert('Upload failed', e?.response?.data?.message || e.message || 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!fullName.trim()) {
      return Alert.alert('Full name is required');
    }
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
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Edit profile"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <TouchableOpacity
            onPress={changeAvatar}
            style={styles.avatarWrap}
            disabled={busy}
            activeOpacity={0.85}
          >
            <View style={{ position: 'relative' }}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={[styles.avatarImage, { borderColor: colors.border }]}
                />
              ) : (
                <Avatar uri={avatarUri} name={fullName} size={112} />
              )}
              <View
                style={[
                  styles.cameraBadge,
                  { backgroundColor: colors.nexusBlue, borderColor: colors.bg },
                ]}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
            <Text
              style={{
                color: colors.electricBlue,
                marginTop: 12,
                fontWeight: '700',
                fontSize: 13,
              }}
            >
              Change photo
            </Text>
            {busy ? (
              <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 6 }} />
            ) : null}
          </TouchableOpacity>

          {/* Fields */}
          <Input
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            maxLength={60}
          />

          <Input
            label="Username"
            value={user?.username || ''}
            editable={false}
            helper="Username cannot be changed"
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about you"
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          <Input
            label="Website"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {/* Private toggle */}
          <TouchableOpacity
            onPress={() => setIsPrivate((v) => !v)}
            style={[
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPrivate ? 'lock-closed-outline' : 'earth-outline'}
              size={22}
              color={colors.text}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                {isPrivate ? 'Private account' : 'Public account'}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {isPrivate
                  ? 'Only your followers can see your posts.'
                  : 'Anyone on Nova can see your posts.'}
              </Text>
            </View>
            <View
              style={[
                styles.switch,
                {
                  backgroundColor: isPrivate ? colors.nexusBlue : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.switchDot,
                  { transform: [{ translateX: isPrivate ? 20 : 0 }] },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Save */}
          <View style={{ marginTop: 24 }}>
            <Button title={busy ? 'Saving…' : 'Save changes'} onPress={save} loading={busy} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});