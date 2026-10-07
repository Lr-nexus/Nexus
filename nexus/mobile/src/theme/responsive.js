import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;   // iPhone SE / 8 baseline
const BASE_HEIGHT = 812;  // iPhone X baseline

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

export const isSmall = SCREEN_WIDTH < 360;
export const isMedium = SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 400;
export const isLarge = SCREEN_WIDTH >= 400;

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;

export const verticalScale = (size) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const fontScale = (size) =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size, 0.35)));