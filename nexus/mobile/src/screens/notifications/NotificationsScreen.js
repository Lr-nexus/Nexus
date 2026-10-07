import React, { useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';

export default function NotificationsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const { items, unread, load, markRead, markAllRead } = useNotifications();

  useEffect(() => { load(); }, [load]);

  const handlePress = (n) => {
    if (!n.readAt) markRead(n._id);
    if (n.type === 'message' && n.data?.conversationId) {
      navigation.navigate(ROUTES.CHAT, { conversation: { _id: n.data.conversationId } });
    } else if (n.fromUserId) {
      navigation.navigate(ROUTES.USER_PROFILE, { userId: n.fromUserId._id || n.fromUserId });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : undefined}
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
        rightIcons={[
          {
            icon: <Text style={{ fontSize: 13, color: colors.electricBlue, fontWeight: '800' }}>Mark all read</Text>,
            onPress: markAllRead,
          },
        ]}
      />

      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.row,
              {
                backgroundColor: item.readAt ? colors.surface : colors.surfaceAlt,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: 8,
              },
            ]}
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
          >
            <Avatar
              uri={item.fromUserId?.profilePicture}
              name={item.fromUserId?.fullName}
              size={42}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {item.title || item.type}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }} numberOfLines={2}>
                {item.body || ''}
              </Text>
              <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
                {timeAgo(item.createdAt)}
              </Text>
            </View>
            {!item.readAt ? (
              <View
                style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: colors.electricBlue, marginLeft: 8,
                }}
              />
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🔔"
            title="You're all caught up"
            subtitle="Likes, comments, follows, messages and mentions will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});