import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { channelsApi } from '../../api/channels.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

export default function ChannelScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { channelId } = route.params || {};
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await channelsApi.get(channelId);
      setChannel(res.channel);
    } catch {} finally { setLoading(false); }
  }, [channelId]);

  useEffect(() => { load(); }, [load]);

  async function toggle() {
    setBusy(true);
    try {
      if (subscribed) {
        await channelsApi.unfollow(channelId);
        setSubscribed(false);
      } else {
        await channelsApi.follow(channelId);
        setSubscribed(true);
      }
    } catch (e) {
      Alert.alert('Could not update', e?.response?.data?.message || 'Try again.');
    } finally { setBusy(false); }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title={channel?.name || 'Channel'}
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.md, alignItems: 'center' }}>
        <Avatar uri={channel?.photo} name={channel?.name} size={96} />
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 12 }}>
          {channel?.name}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>
          {channel?.subscribersCount || 0} subscribers
        </Text>
        {channel?.description ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>
            {channel.description}
          </Text>
        ) : null}

        <View style={{ marginTop: 20, minWidth: 220 }}>
          <Button
            title={subscribed ? 'Unsubscribe' : 'Subscribe'}
            variant={subscribed ? 'danger' : 'primary'}
            onPress={toggle}
            loading={busy}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });