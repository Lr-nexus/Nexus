import React from 'react';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * Unified icon component.
 * <Icon name="heart-outline" />        → Ionicons
 * <Icon family="mci" name="fire" />    → MaterialCommunityIcons
 * <Icon family="feather" name="send" /> → Feather
 */
export default function Icon({
  name,
  size = 22,
  color,
  family = 'ionicons',
  style,
}) {
  const { colors } = useTheme();
  const resolved = color || colors.text;

  if (family === 'mci') {
    return <MaterialCommunityIcons name={name} size={size} color={resolved} style={style} />;
  }
  if (family === 'feather') {
    return <Feather name={name} size={size} color={resolved} style={style} />;
  }
  return <Ionicons name={name} size={size} color={resolved} style={style} />;
}