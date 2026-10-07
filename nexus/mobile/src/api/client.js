import axios from 'axios';
import { secureStorage } from '../utils/secureStorage';
import { API_URL, TOKEN_KEYS } from '../constants/config';

const client = axios.create({ baseURL: API_URL, timeout: 25000 });

client.interceptors.request.use(async (cfg) => {
  const token = await secureStorage.getItem(TOKEN_KEYS.ACCESS);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshing = null;

client.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          (async () => {
            const rt = await secureStorage.getItem(TOKEN_KEYS.REFRESH);
            if (!rt) throw new Error('no_refresh');
            const { data } = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: rt,
            });
            await secureStorage.setItem(TOKEN_KEYS.ACCESS, data.accessToken);
            await secureStorage.setItem(TOKEN_KEYS.REFRESH, data.refreshToken);
            return data.accessToken;
          })();
        const newToken = await refreshing;
        refreshing = null;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (e) {
        refreshing = null;
        await secureStorage.deleteItem(TOKEN_KEYS.ACCESS);
        await secureStorage.deleteItem(TOKEN_KEYS.REFRESH);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const unwrap = (p) => p.then((r) => r.data);
export default client;