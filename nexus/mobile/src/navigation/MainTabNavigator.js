import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

import HomeStackNavigator from './HomeStackNavigator';
import ChatStackNavigator from './ChatStackNavigator';
import RizzStackNavigator from './RizzStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tabs = createBottomTabNavigator();

function EmptyCreateScreen() {
  return <View />;
}

function TabIcon({ emoji, focused, color }) {
  return (
    <Text
      style={{
        fontSize: focused ? 24 : 22,
        opacity: focused ? 1 : 0.65,
        color,
        includeFontPadding: false,
      }}
    >
      {emoji}
    </Text>
  );
}

function CreateTabButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.createBtn} activeOpacity={0.85}>
      <Text style={styles.createIcon}>＋</Text>
    </TouchableOpacity>
  );
}

export default function MainTabNavigator({ navigation }) {
  const { colors } = useTheme();
  const { unread } = useNotifications();
  const insets = useSafeAreaInsets();

  const tabBarHeight = 56 + Math.max(insets.bottom, 8);

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarActiveTintColor: colors.electricBlue,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
     >
      <Tabs.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🏠" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ChatsTab"
        component={ChatStackNavigator}
        options={{
          title: 'Chats',
          tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, color: '#fff', fontSize: 10 },
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="💬" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="CreateTab"
        component={EmptyCreateScreen}
        options={{
          title: '',
          tabBarButton: () => (
            <CreateTabButton onPress={() => navigation.navigate('CreatePost')} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreatePost');
          },
        }}
      />
      <Tabs.Screen
        name="RizzTab"
        component={RizzStackNavigator}
        options={{
          title: 'Rizz AI',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🔥" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="👤" focused={focused} color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    top: -14,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  createIcon: { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -2, includeFontPadding: false },
});