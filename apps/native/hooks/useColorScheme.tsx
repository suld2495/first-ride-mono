import { useColorSchemeStore } from '@/store/colorScheme.store';

export const useColorScheme = () => {
  const { colorScheme } = useColorSchemeStore();

  return colorScheme;
};
