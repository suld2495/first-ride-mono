/* eslint-disable local-rules/no-barrel-import, local-rules/no-multiple-components-in-file */
import { Fragment, type PropsWithChildren } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useBaseColorSchemeValue } from '@/hooks/useThemePreference';
import tamaguiConfig from '@/theme';

export const AppTamaguiProvider = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
      <Theme name={colorScheme}>{children}</Theme>
    </TamaguiProvider>
  );
};

export const ThemeStyleRefreshBoundary = ({ children }: PropsWithChildren) => {
  const baseColorScheme = useBaseColorSchemeValue();

  return <Fragment key={baseColorScheme}>{children}</Fragment>;
};

export default AppTamaguiProvider;
