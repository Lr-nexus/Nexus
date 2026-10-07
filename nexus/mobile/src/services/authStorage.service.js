import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEYS } from '../constants/config';

export const authStorage = {
  async save({ accessToken, refreshToken }) {
    if (accessToken) await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken);
    if (refreshToken) await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);
  },
  async getAccess() {
    return SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
  },
  async getRefresh() {
    return SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
  },
};