import React from 'react';
import {
  Modal as RNModal, View, Text, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  dismissOnBackdrop = true,
  position = 'center', // center | bottom
  maxWidth = 420,
}) {
  const { colors, radius, spacing } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <TouchableWithoutFeedback
          onPress={dismissOnBackdrop ? onClose : undefined}
          accessible={false}
        >
          <View style={[styles.backdrop, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>

        <View
          style={[
            position === 'bottom' ? styles.bottomWrap : styles.centerWrap,
            { paddingHorizontal: spacing.lg },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                maxWidth,
                padding: spacing.lg,
                borderColor: colors.border,
              },
            ]}
          >
            {title ? (
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 22, lineHeight: 22 }}>×</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View>{children}</View>

            {footer ? <View style={{ marginTop: spacing.lg }}>{footer}</View> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  centerWrap: { alignItems: 'center', justifyContent: 'center' },
  bottomWrap: { flex: 1, justifyContent: 'flex-end', paddingBottom: 20 },
  card: { width: '100%', borderWidth: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700' },
});