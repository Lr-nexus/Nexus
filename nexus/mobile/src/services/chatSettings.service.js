import { storage } from '../utils/storage';

const WALLPAPER_KEY = (id) => `nova_wallpaper_${id}`;
const MUTE_KEY = (id) => `nova_muted_${id}`;

export const chatSettings = {
  async getWallpaper(conversationId) {
    if (!conversationId) return null;
    return storage.get(WALLPAPER_KEY(conversationId));
  },

  async setWallpaper(conversationId, uri) {
    if (!conversationId) return;
    await storage.set(WALLPAPER_KEY(conversationId), uri);
  },

  async clearWallpaper(conversationId) {
    if (!conversationId) return;
    await storage.remove(WALLPAPER_KEY(conversationId));
  },

  async isMuted(conversationId) {
    if (!conversationId) return false;
    const v = await storage.get(MUTE_KEY(conversationId));
    return !!v;
  },

  async setMuted(conversationId, muted) {
    if (!conversationId) return;
    if (muted) await storage.set(MUTE_KEY(conversationId), true);
    else await storage.remove(MUTE_KEY(conversationId));
  },

  async toggleMuted(conversationId) {
    const current = await this.isMuted(conversationId);
    await this.setMuted(conversationId, !current);
    return !current;
  },
};