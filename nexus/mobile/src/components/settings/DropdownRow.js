import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function DropdownRow({ label, value, options, onChange, colors: c }) {
  const ctx = useTheme();
  const colors = c || ctx.colors;
  const { radius } = ctx;
  const [open, setOpen] = useState(false);

  const currentLabel = options.find((o) => o.key === value)?.label || value || 'Select…';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: 14,
            paddingVertical: 14,
            marginBottom: 8,
          },
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={{ color: colors.text, flex: 1, fontSize: 14 }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginRight: 8 }}>
          {currentLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textDim} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface, borderRadius: radius.xl }]}
            onPress={() => {}}
          >
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 14 }}>
              {label}
            </Text>
            {options.map((opt) => {
              const active = opt.key === value;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => { onChange(opt.key); setOpen(false); }}
                  style={styles.optionRow}
                  activeOpacity={0.75}
                >
                  <Text
                    style={{
                      color: active ? colors.electricBlue : colors.text,
                      fontWeight: active ? '800' : '600',
                      fontSize: 15,
                      flex: 1,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={20} color={colors.electricBlue} /> : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: { width: '100%', maxWidth: 400, padding: 20 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
});