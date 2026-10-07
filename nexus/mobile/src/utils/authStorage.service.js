import { secureStorage } from '../utils/secureStorage';
import { TOKEN_KEYS } from '../constants/config';

export const authStorage = {
  async save({ accessToken, refreshToken }) {
    if (accessToken) await secureStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    if (refreshToken) await secureStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  },

  async getAccess() {
    return secureStorage.getItem(TOKEN_KEYS.ACCESS);
  },

  async getRefresh() {
    return secureStorage.getItem(TOKEN_KEYS.REFRESH);
  },

  async clear() {
    await secureStorage.deleteItem(TOKEN_KEYS.ACCESS);
    await secureStorage.deleteItem(TOKEN_KEYS.REFRESH);
  },
};