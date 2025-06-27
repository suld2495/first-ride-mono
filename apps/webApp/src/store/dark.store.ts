import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface State {
  isDarkMode: boolean;
}

interface Actions {
  toggleDarkMode: () => void;
}

export const useDarkModeStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        toggleDarkMode: () =>
          set((state) => ({ isDarkMode: !state.isDarkMode })),
      }),
      {
        name: 'dark-storage',
      },
    ),
  ),
);
