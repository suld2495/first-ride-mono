import {
  getEffectiveColorScheme,
  useColorSchemeStore,
} from '@/store/color-scheme.store';

export const getEffectiveColorSchemeSnapshot = () =>
  getEffectiveColorScheme(useColorSchemeStore.getState());

export const useEffectiveColorScheme = () =>
  useColorSchemeStore((state) => getEffectiveColorScheme(state));
