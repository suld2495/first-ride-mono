import * as SecureStore from 'expo-secure-store';
import { createJSONStorage } from 'zustand/middleware';

export const storage = createJSONStorage(() => ({
  getItem(name: string) {
    return SecureStore.getItemAsync(name);
  },

  setItem(name: string, value: string) {
    SecureStore.setItemAsync(name, value);
  },

  removeItem(name: string) {
    SecureStore.deleteItemAsync(name);
  },
}));
