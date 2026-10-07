import React from 'react';
import { View } from 'react-native';
import Input from '../common/Input';
import { useTheme } from '../../context/ThemeContext';

export default function AuthInput({ label, error, style, ...rest }) {
  const { colors } = useTheme();
  return (
    <View style={style}>
      <Input label={label} error={error} autoCorrect={false} {...rest} />
    </View>
  );
}