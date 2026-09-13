import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeName } from '@/theme/themes';

import { storage } from './storage-provider.store';

type ColorScheme = ThemeName;

interface ColorSchemeState {
  colorScheme: ColorScheme;
  colorSchemeOverride: ColorScheme | null;
  /** 홈 화면을 제외한 화면에서 배경·텍스트를 회색 계열(중립 표면)로 그리는지 여부. 라우트에 따라 자동으로 바뀐다. */
  neutralSurface: boolean;
}

interface Action {
  setColorScheme: (colorScheme: ColorScheme) => void;
  setColorSchemeOverride: (colorScheme: ColorScheme) => void;
  clearColorSchemeOverride: () => void;
  setNeutralSurface: (neutralSurface: boolean) => void;
  syncWithTamagui: () => void;
}

export const getEffectiveColorScheme = (state: ColorSchemeState): ColorScheme =>
  state.colorSchemeOverride ?? state.colorScheme;

export const useColorSchemeStore = create<ColorSchemeState & Action>()(
  persist(
    (set, get) => ({
      colorScheme: 'blue',
      colorSchemeOverride: null,
      neutralSurface: false,
      setColorScheme: (colorScheme: ColorScheme) => {
        set({ colorScheme });
      },
      setNeutralSurface: (neutralSurface: boolean) => {
        if (get().neutralSurface === neutralSurface) return;

        set({ neutralSurface });
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
