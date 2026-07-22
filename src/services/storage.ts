import { AppSettings, UserProfile } from '../types';

const STORAGE_KEYS = {
  AUTH_USER: '@aquaguard_auth_user',
  SETTINGS: '@aquaguard_app_settings',
  OFFLINE_CACHE: '@aquaguard_offline_cache',
};

// In-memory persistent state mock for React Native environment
const inMemoryCache: Record<string, string> = {};

export const StorageService = {
  async saveUser(user: UserProfile): Promise<void> {
    inMemoryCache[STORAGE_KEYS.AUTH_USER] = JSON.stringify(user);
  },

  async getUser(): Promise<UserProfile | null> {
    const data = inMemoryCache[STORAGE_KEYS.AUTH_USER];
    return data ? JSON.parse(data) : null;
  },

  async clearUser(): Promise<void> {
    delete inMemoryCache[STORAGE_KEYS.AUTH_USER];
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    inMemoryCache[STORAGE_KEYS.SETTINGS] = JSON.stringify(settings);
  },

  async getSettings(): Promise<Partial<AppSettings>> {
    const data = inMemoryCache[STORAGE_KEYS.SETTINGS];
    return data ? JSON.parse(data) : {};
  },

  async saveOfflineCache(key: string, value: any): Promise<void> {
    inMemoryCache[`${STORAGE_KEYS.OFFLINE_CACHE}_${key}`] = JSON.stringify({
      data: value,
      timestamp: new Date().toISOString(),
    });
  },

  async getOfflineCache(key: string): Promise<{ data: any; timestamp: string } | null> {
    const raw = inMemoryCache[`${STORAGE_KEYS.OFFLINE_CACHE}_${key}`];
    return raw ? JSON.parse(raw) : null;
  },
};
