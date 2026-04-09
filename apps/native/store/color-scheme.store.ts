import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage } from './storage-provider.store';

type ColorScheme = 'light' | 'dark';

interface ColorSchemeState {
  colorScheme: ColorScheme;
}

interface Action {
  setColorScheme: (colorScheme: ColorScheme) => void;
  syncWithUnistyles: () => void;
}

export const useColorSchemeStore = create<ColorSchemeState & Action>()(
  persist(
    (set, get) => ({
      colorScheme: 'dark',
      setColorScheme: (colorScheme: ColorScheme) => {
        set({ colorScheme });
      },
      syncWithUnistyles: () => {
        // Tamagui Provider가 store를 직접 구독하므로 별도 런타임 동기화는 필요 없다.
        get();
      },
    }),
    {
      name: 'colorScheme',
      storage,
    },
  ),
);
