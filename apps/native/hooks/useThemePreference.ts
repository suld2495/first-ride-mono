import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { useColorSchemeStore } from '@/store/color-scheme.store';

export const useThemePreference = useEffectiveColorScheme;

export const useColorSchemeValue = useThemePreference;

export const useSetThemePreference = () =>
  useColorSchemeStore((state) => state.setColorScheme);

export const useSetAppColorScheme = useSetThemePreference;

export const useSyncThemePreference = () =>
  useColorSchemeStore((state) => state.syncWithTamagui);

export const useSyncAppColorScheme = useSyncThemePreference;
