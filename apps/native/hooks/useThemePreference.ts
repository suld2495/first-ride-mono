import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { useColorSchemeStore } from '@/store/color-scheme.store';

export const useThemePreference = useEffectiveColorScheme;

export const useColorSchemeValue = useThemePreference;

export const useBaseThemePreference = () =>
  useColorSchemeStore((state) => state.colorScheme);

export const useBaseColorSchemeValue = useBaseThemePreference;

export const useSetThemePreference = () =>
  useColorSchemeStore((state) => state.setColorScheme);

export const useSetAppColorScheme = useSetThemePreference;

export const useClearThemePreferenceOverride = () =>
  useColorSchemeStore((state) => state.clearColorSchemeOverride);

export const useClearAppColorSchemeOverride = useClearThemePreferenceOverride;

export const useSyncThemePreference = () =>
  useColorSchemeStore((state) => state.syncWithTamagui);

export const useSyncAppColorScheme = useSyncThemePreference;
