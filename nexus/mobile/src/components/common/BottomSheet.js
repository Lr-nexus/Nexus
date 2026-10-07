import React from 'react';
import {
  Modal as RNModal, View, Text, TouchableWithoutFeedback, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function BottomSheet({
  visible,
  onClose,
  title,
  items = [],
  children,
  dismissOnBackdrop = true,
}) {
  const { colors, radius, spacing } = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={dismissOnBackdrop ? onClose : undefined}>
          <View style={[styles.backdrop, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>

        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />

          {title ? (
            <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>
              {title}
            </Text>
          ) : null}

          {children}

          {items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.item, { paddingHorizontal: spacing.lg }]}
              onPress={() => {
                onClose?.();
                item.onPress?.();
              }}
              activeOpacity={0.7}
            >
              {item.icon ? <View style={{ marginRight: 14 }}>{item.icon}</View> : null}
              <Text
                style={{
                  color: item.destructive ? colors.danger : colors.text,
                  fontSize: 15,
                  fontWeight: '600',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { paddingTop: 8, paddingBottom: 12, minHeight: 120 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', paddingVertical: 12 },
  item: { height: 54, flexDirection: 'row', alignItems: 'center' },
});