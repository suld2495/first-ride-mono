import * as SecureStore from 'expo-secure-store';
import { createJSONStorage } from 'zustand/middleware';

export const storage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    return SecureStore.getItemAsync(name);
  },

  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },

  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
}));
