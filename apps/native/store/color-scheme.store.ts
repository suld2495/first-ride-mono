import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeName } from '@/theme/themes';

import { storage } from './storage-provider.store';

type ColorScheme = ThemeName;

interface ColorSchemeState {
  colorScheme: ColorScheme;
  colorSchemeOverride: ColorScheme | null;
}

interface Action {
  setColorScheme: (colorScheme: ColorScheme) => void;
  setColorSchemeOverride: (colorScheme: ColorScheme) => void;
  clearColorSchemeOverride: () => void;
  syncWithTamagui: () => void;
}

export const getEffectiveColorScheme = (state: ColorSchemeState): ColorScheme =>
  state.colorSchemeOverride ?? state.colorScheme;

export const useColorSchemeStore = create<ColorSchemeState & Action>()(
  persist(
    (set, get) => ({
      colorScheme: 'blue',
      colorSchemeOverride: null,
      setColorScheme: (colorScheme: ColorScheme) => {
        set({ colorScheme });
      },
      setColorSchemeOverride: (colorScheme: ColorScheme) => {
        set({ colorSchemeOverride: colorScheme });
      },
      clearColorSchemeOverride: () => {
        set({ colorSchemeOverride: null });
      },
      syncWithTamagui: () => {
        // Tamagui Provider가 store를 직접 구독하므로 별도 런타임 동기화는 필요 없다.
        get();
      },
    }),
    {
      name: 'colorScheme',
      storage,
      partialize: (state) => ({ colorScheme: state.colorScheme }),
    },
  ),
);
