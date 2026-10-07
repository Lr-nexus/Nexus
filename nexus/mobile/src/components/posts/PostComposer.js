import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function PostComposer({ onPress }) {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginHorizontal: spacing.md,
          marginBottom: spacing.md,
          padding: spacing.md,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Avatar uri={user?.profilePicture} name={user?.fullName} size={38} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.textDim, fontSize: 14 }}>
          Share something with Nova…
        </Text>
      </View>
      <Text style={{ fontSize: 20 }}>📸</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});