import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { communitiesApi } from '../../api/communities.api';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function CommunityScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { communityId } = route.params || {};
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await communitiesApi.get(communityId);
      setCommunity(res.community);
      setMembers(res.members || []);
    } catch {}
    finally { setLoading(false); }
  }, [communityId]);

  useEffect(() => { load(); }, [load]);

  async function join() {
    setBusy(true);
    try { await communitiesApi.join(communityId); await load(); }
    catch (e) { Alert.alert('Could not join', e?.response?.data?.message || 'Try again.'); }
    finally { setBusy(false); }
  }

  async function leave() {
    setBusy(true);
    try { await communitiesApi.leave(communityId); navigation.goBack(); }
    catch (e) { Alert.alert('Could not leave', e?.response?.data?.message || 'Try again.'); }
    finally { setBusy(false); }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.electricBlue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const isMember = members.some((m) => m.userId?._id);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title={community?.name || 'Community'}
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <FlatList
        data={members}
        keyExtractor={(i) => i._id}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <Avatar uri={community?.photo} name={community?.name} size={96} />
              <Text style={[styles.name, { color: colors.text }]}>{community?.name}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4 }}>
                {community?.membersCount || 0} members
              </Text>
              {community?.description ? (
                <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
                  {community.description}
                </Text>
              ) : null}

              <View style={{ marginTop: 16, minWidth: 220 }}>
                {isMember ? (
                  <Button title="Leave" variant="danger" onPress={leave} loading={busy} />
                ) : (
                  <Button title="Join community" onPress={join} loading={busy} />
                )}
              </View>
            </View>

            <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
              MEMBERS
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}>
            <Avatar uri={item.userId?.profilePicture} name={item.userId?.fullName} size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {item.userId?.fullName}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>@{item.userId?.username}</Text>
            </View>
            {item.role !== 'member' ? <Badge label={item.role} variant="primary" size="sm" /> : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 20, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
});