import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { conversationsApi } from '../../api/conversations.api';
import Header from '../../components/common/Header';

export default function LocationShareScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId } = route.params || {};

  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied', 'Enable location in Settings to share it.');
        return navigation.goBack();
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      // Try to reverse geocode
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (places?.[0]) {
          const p = places[0];
          const parts = [p.name, p.street, p.city, p.region, p.country].filter(Boolean);
          setAddress(parts.join(', '));
        }
      } catch {}
    } catch (e) {
      Alert.alert('Could not get location', e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLocation(); }, []);

  async function send() {
    if (!coords) return;
    setSending(true);
    try {
      await conversationsApi.send(conversationId, {
        type: 'location',
        content: address || 'Shared location',
        media: {
          url: `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
          publicId: `${coords.latitude},${coords.longitude}`,
          name: address || 'Location',
        },
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Send failed', e?.response?.data?.message || 'Try again.');
    } finally { setSending(false); }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Share location"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={{ flex: 1, padding: spacing.lg }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.electricBlue} size="large" />
            <Text style={{ color: colors.textMuted, marginTop: 12 }}>Getting your location…</Text>
          </View>
        ) : coords ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
            ]}
          >
            <View style={styles.mapPreview}>
              <Ionicons name="location" size={60} color={colors.nexusBlue} />
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </Text>
            </View>

            {address ? (
              <View style={{ padding: spacing.md }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                  NEARBY
                </Text>
                <Text style={{ color: colors.text, fontSize: 15, marginTop: 4, lineHeight: 21 }}>
                  {address}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={loadLocation}
              style={{ padding: spacing.md, alignItems: 'center' }}
            >
              <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>
                ↻ Refresh location
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={send}
          disabled={!coords || sending}
          style={[
            styles.sendBtn,
            {
              backgroundColor: coords ? colors.nexusBlue : colors.card,
              borderRadius: radius.md,
            },
          ]}
        >
          {sending ? <ActivityIndicator color="#fff" /> : (
            <Text
              style={{
                color: coords ? '#fff' : colors.textDim,
                fontWeight: '800',
                fontSize: 16,
                includeFontPadding: false,
              }}
            >
              Send location
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, overflow: 'hidden' },
  mapPreview: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  sendBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
});