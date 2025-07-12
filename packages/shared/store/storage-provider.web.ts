import { createJSONStorage } from 'zustand/middleware';

export const storage = createJSONStorage(() => ({
  getItem: async (name: string) => window.localStorage.getItem(name) ?? null,
  setItem: async (name: string, value: string) =>
    window.localStorage.setItem(name, value),
  removeItem: async (name: string) => window.localStorage.removeItem(name),
}));
