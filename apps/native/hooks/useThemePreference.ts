import { useColorSchemeStore } from '@/store/color-scheme.store';

export const useThemePreference = () =>
  useColorSchemeStore((state) => state.colorScheme);

export const useColorSchemeValue = useThemePreference;

export const useSetThemePreference = () =>
  useColorSchemeStore((state) => state.setColorScheme);

export const useSetAppColorScheme = useSetThemePreference;

export const useSyncThemePreference = () =>
  useColorSchemeStore((state) => state.syncWithUnistyles);

export const useSyncAppColorScheme = useSyncThemePreference;
