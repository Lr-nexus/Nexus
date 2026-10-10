import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async getItem(key) {
    if (isWeb) return AsyncStorage.getItem(key);
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    if (isWeb) return AsyncStorage.setItem(key, value);
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch {}
  },

  async deleteItem(key) {
    if (isWeb) return AsyncStorage.removeItem(key);
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

// Compatibility aliases for legacy code that used the old method names
secureStorage.getItemAsync = secureStorage.getItem;
secureStorage.setItemAsync = secureStorage.setItem;
secureStorage.deleteItemAsync = secureStorage.deleteItem;
secureStorage.deleteValueWithKeyAsync = secureStorage.deleteItem;
secureStorage.getValueWithKeyAsync = secureStorage.getItem;