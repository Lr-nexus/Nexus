import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import { ROUTES } from '../../constants/routes';

const ITEMS = [
  { key: 'account', title: 'Account', icon: 'person-outline', route: ROUTES.EDIT_PROFILE },
  { key: 'privacy', title: 'Privacy', icon: 'lock-closed-outline', route: ROUTES.PRIVACY_SETTINGS },
  { key: 'notifications', title: 'Notifications', icon: 'notifications-outline', route: ROUTES.NOTIFICATION_SETTINGS },
  { key: 'appearance', title: 'Appearance', icon: 'color-palette-outline', route: ROUTES.APPEARANCE_SETTINGS },
  { key: 'chat', title: 'Chat settings', icon: 'chatbubble-outline', route: ROUTES.CHAT_SETTINGS },
  { key: 'security', title: 'Security', icon: 'shield-checkmark-outline', route: ROUTES.SECURITY_SETTINGS },
  { key: 'app_lock', title: 'App Lock', icon: 'finger-print-outline', route: ROUTES.APP_LOCK },
  { key: 'login_activity', title: 'Login activity', icon: 'phone-portrait-outline', route: ROUTES.LOGIN_ACTIVITY },
  { key: 'ai', title: 'AI settings', icon: 'flame-outline', route: ROUTES.AI_SETTINGS },
  { key: 'about', title: 'About Nova', icon: 'information-circle-outline', route: ROUTES.ABOUT },
];

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  function confirmLogout() {
    Alert.alert('Log out?', 'You will need your password to log back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete your profile, posts, messages, stories, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.deleteMe();
              await logout();
            } catch (e) {
              Alert.alert('Could not delete account', e?.response?.data?.message || 'Try again.');
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Settings"
        leftIcon={<Ionicons name="chevron-back" size={26} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
          ]}
        >
          <Avatar uri={user?.profilePicture} name={user?.fullName} size={52} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{user?.fullName}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              @{user?.username} · {user?.email}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.item,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: 8 },
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.75}
            >
              <Ionicons name={item.icon} size={20} color={colors.text} style={{ width: 28 }} />
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={confirmDeleteAccount}
            style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, marginTop: 6 }]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ width: 28 }} />
            <Text style={{ color: colors.danger, fontWeight: '800', flex: 1 }}>Delete account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmLogout}
            style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, marginTop: 8 }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ width: 28 }} />
            <Text style={{ color: colors.danger, fontWeight: '800', flex: 1 }}>Log out</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: colors.textDim, textAlign: 'center', fontSize: 11, marginTop: 20 }}>
          NOVA · by Nexus · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});