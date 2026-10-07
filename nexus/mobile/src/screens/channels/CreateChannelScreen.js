import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { channelsApi } from '../../api/channels.api';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function CreateChannelScreen() {
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
      const res = await channelsApi.create({ name: name.trim(), description: description.trim(), isPrivate });
      navigation.replace('Channel', { channelId: res.channel._id });
    } catch (e) {
      Alert.alert('Could not create', e?.response?.data?.message || 'Try again.');
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="New channel"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input label="Channel name" value={name} onChangeText={setName} placeholder="Nexus Updates" />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What will you broadcast?"
          multiline
          numberOfLines={4}
        />
        <Button
          title={isPrivate ? '🔒 Private channel' : '🌍 Public channel'}
          variant="secondary"
          onPress={() => setIsPrivate((v) => !v)}
        />
        <View style={{ height: 12 }} />
        <Button title={busy ? 'Creating…' : 'Create channel'} onPress={create} loading={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });