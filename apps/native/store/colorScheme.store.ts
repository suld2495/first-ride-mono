import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage } from '.';

interface ColorSchemeState {
  colorScheme: 'light' | 'dark';
}

interface Action {
  setColorScheme: (colorScheme: 'light' | 'dark') => void;
}

export const useColorSchemeStore = create<ColorSchemeState & Action>()(
  persist(
    (set) => ({
      colorScheme: 'light',
      setColorScheme: (colorScheme: 'light' | 'dark') => set({ colorScheme }),
    }),
    {
      name: 'colorScheme',
      storage,
    },
  ),
);
