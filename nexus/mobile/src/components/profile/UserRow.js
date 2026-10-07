import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

export default function UserRow({ user, onPress, actionLabel, onAction, secondary }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: 10 }]}>
      <TouchableOpacity onPress={onPress} style={styles.left} activeOpacity={0.85}>
        <Avatar uri={user?.profilePicture} name={user?.fullName} size={46} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
            {user?.fullName || user?.username}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>
            @{user?.username}
          </Text>
          {secondary ? (
            <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
              {secondary}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {actionLabel ? (
        <Button
          title={actionLabel}
          size="sm"
          variant="secondary"
          onPress={onAction}
          fullWidth={false}
          style={{ minWidth: 100 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center' },
});