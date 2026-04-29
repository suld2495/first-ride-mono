import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeName } from '@/theme/themes';

import { storage } from './storage-provider.store';

type ColorScheme = ThemeName;

interface ColorSchemeState {
  colorScheme: ColorScheme;
}

interface Action {
  setColorScheme: (colorScheme: ColorScheme) => void;
  syncWithTamagui: () => void;
}

export const useColorSchemeStore = create<ColorSchemeState & Action>()(
  persist(
    (set, get) => ({
      colorScheme: 'dark',
      setColorScheme: (colorScheme: ColorScheme) => {
        set({ colorScheme });
      },
      syncWithTamagui: () => {
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
