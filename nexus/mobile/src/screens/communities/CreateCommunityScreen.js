import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { communitiesApi } from '../../api/communities.api';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function CreateCommunityScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) return Alert.alert('Give it a name');
    setBusy(true);
    try {
      const res = await communitiesApi.create({
        name: name.trim(), description: description.trim(), isPrivate,
      });
      navigation.replace('Community', { communityId: res.community._id });
    } catch (e) {
      Alert.alert('Could not create', e?.response?.data?.message || 'Try again.');
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="New community"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Designers of Lagos" />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What is this community about?"
          multiline
          numberOfLines={4}
        />
        <Button
          title={isPrivate ? '🔒 Private' : '🌍 Public'}
          variant="secondary"
          onPress={() => setIsPrivate((v) => !v)}
        />
        <View style={{ height: 12 }} />
        <Button title={busy ? 'Creating…' : 'Create community'} onPress={create} loading={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });