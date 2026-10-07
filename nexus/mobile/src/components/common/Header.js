import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale, fontScale } from '../../theme/responsive';

export default function Header({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcons = [],
  centerTitle = false,
  transparent = false,
  showBorder = true,
  style,
}) {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        {
          backgroundColor: transparent ? 'transparent' : colors.bg,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={[styles.row, { paddingHorizontal: spacing.md, minHeight: moderateScale(54) }]}>
        <View style={styles.side}>
          {leftIcon ? (
            <TouchableOpacity
              onPress={onLeftPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.iconBtn}
            >
              {leftIcon}
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.center, centerTitle && { alignItems: 'center' }]}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text, fontSize: fontScale(17) }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.sub, { color: colors.textMuted, fontSize: fontScale(12) }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, { justifyContent: 'flex-end' }]}>
          {rightIcons.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={item.onPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[styles.iconBtn, idx > 0 && { marginLeft: 4 }]}
            >
              {item.icon}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 84, flexDirection: 'row', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700' },
  sub: { marginTop: 1 },
});