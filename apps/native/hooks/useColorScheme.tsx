import {
  useColorSchemeValue,
  useSetAppColorScheme,
} from '@/hooks/useThemePreference';

export const useColorScheme = () => {
  return useColorSchemeValue();
};

export const useSetColorScheme = () => {
  return useSetAppColorScheme();
};
