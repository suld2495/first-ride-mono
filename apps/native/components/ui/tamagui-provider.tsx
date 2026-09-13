/* eslint-disable local-rules/no-barrel-import, local-rules/no-multiple-components-in-file */
import { Fragment, type PropsWithChildren } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useNeutralSurface } from '@/hooks/useEffectiveColorScheme';
import { useBaseColorSchemeValue } from '@/hooks/useThemePreference';
import tamaguiConfig from '@/theme';
import { getNeutralThemeName } from '@/theme/themes';

export const AppTamaguiProvider = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const neutralSurface = useNeutralSurface();
  const themeName = neutralSurface
    ? getNeutralThemeName(colorScheme)
    : colorScheme;

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
      <Theme name={themeName}>{children}</Theme>
    </TamaguiProvider>
  );
};

export const ThemeStyleRefreshBoundary = ({ children }: PropsWithChildren) => {
  const baseColorScheme = useBaseColorSchemeValue();

  return <Fragment key={baseColorScheme}>{children}</Fragment>;
};

export default AppTamaguiProvider;
