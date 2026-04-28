/**
 * Storage Utility Functions
 */

import { STORAGE_KEYS } from '../constants';

/**
 * Get item from localStorage
 */
export const getStorageItem = <T = any>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage: ${key}`, error);
    return null;
  }
};

/**
 * Set item in localStorage
 */
export const setStorageItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to storage: ${key}`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage: ${key}`, error);
  }
};

/**
 * Clear all localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage', error);
  }
};

/**
 * Auth token management
 */
export const authStorage = {
  getToken: () => getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token: string) => setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => removeStorageItem(STORAGE_KEYS.AUTH_TOKEN),

  getUser: () => getStorageItem<any>(STORAGE_KEYS.AUTH_USER),
  setUser: (user: any) => setStorageItem(STORAGE_KEYS.AUTH_USER, user),
  removeUser: () => removeStorageItem(STORAGE_KEYS.AUTH_USER),

  clear: () => {
    removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    removeStorageItem(STORAGE_KEYS.AUTH_USER);
  },
};
