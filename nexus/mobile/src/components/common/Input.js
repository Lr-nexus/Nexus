import React, { forwardRef, useState } from 'react';
import {
  View, TextInput, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale, fontScale } from '../../theme/responsive';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    leftIcon = null,
    rightIcon = null,
    onRightIconPress,
    secureTextEntry = false,
    showPasswordToggle = false,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    containerStyle,
    inputStyle,
    ...rest
  },
  ref
) {
  const { colors, radius, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.electricBlue : colors.border;
  const baseHeight = moderateScale(52);
  const showEye = secureTextEntry && showPasswordToggle;

  return (
    <View style={[styles.wrap, { marginBottom: spacing.md }, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textMuted, fontSize: fontScale(13), marginBottom: spacing.xs + 2 }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderRadius: radius.md,
            minHeight: multiline ? moderateScale(100) : baseHeight,
            alignItems: multiline ? 'flex-start' : 'center',
            paddingVertical: multiline ? moderateScale(10) : 0,
          },
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          placeholderTextColor={colors.textDim}
          selectionColor={colors.electricBlue}
          secureTextEntry={secureTextEntry && !reveal}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: fontScale(15),
              minHeight: multiline ? moderateScale(80) : moderateScale(48),
              textAlignVertical: multiline ? 'top' : 'center',
              paddingTop: multiline ? 4 : 0,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {showEye ? (
          <TouchableOpacity
            onPress={() => setReveal((v) => !v)}
            style={styles.iconRight}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={reveal ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.danger, fontSize: fontScale(12) }]}>{error}</Text>
      ) : helper ? (
        <Text style={[styles.helper, { color: colors.textDim, fontSize: fontScale(12) }]}>{helper}</Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  wrap: {},
  label: { fontWeight: '600', letterSpacing: 0.2 },
  row: { flexDirection: 'row', borderWidth: 1, paddingHorizontal: 12 },
  input: { flex: 1, padding: 0 },
  iconLeft: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  error: { marginTop: 5 },
  helper: { marginTop: 5 },
});