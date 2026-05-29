import { useLayoutEffect } from 'react';

import { useColorSchemeStore } from '@/store/color-scheme.store';
import type { ThemeName } from '@/theme/themes';

export const useScopedColorSchemeOverride = (themeName?: ThemeName) => {
  const activeOverride = useColorSchemeStore(
    (state) => state.colorSchemeOverride,
  );
  const setColorSchemeOverride = useColorSchemeStore(
    (state) => state.setColorSchemeOverride,
  );
  const clearColorSchemeOverride = useColorSchemeStore(
    (state) => state.clearColorSchemeOverride,
  );

  useLayoutEffect(() => {
    if (!themeName) {
      return undefined;
    }

    setColorSchemeOverride(themeName);

    return () => {
      clearColorSchemeOverride();
    };
  }, [clearColorSchemeOverride, setColorSchemeOverride, themeName]);

  return !themeName || activeOverride === themeName;
};
