import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo Go (SDK 53+) removed remote push notifications.
// Detect it and disable all push-related code paths.
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  if (isExpoGo) {
    console.log('[notifications] Expo Go detected — skipping push registration.');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[notifications] Not a physical device — skipping push registration.');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  try {
    const token = (await Notifications.getPushTokenAsync()).data;
    return token;
  } catch (e) {
    console.log('[notifications] Push token error:', e?.message);
    return null;
  }
}

export const notificationsSupported = !isExpoGo;