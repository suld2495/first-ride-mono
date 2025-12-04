import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage } from '.';

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
        // Unistyles 테마도 함께 변경
        UnistylesRuntime.setTheme(colorScheme);
      },
      syncWithUnistyles: () => {
        // 앱 시작 시 저장된 테마를 Unistyles에 동기화
        const { colorScheme } = get();
        UnistylesRuntime.setTheme(colorScheme);
      },
    }),
    {
      name: 'colorScheme',
      storage,
    },
  ),
);
