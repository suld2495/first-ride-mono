/* eslint-disable local-rules/no-barrel-import, local-rules/no-multiple-components-in-file */
import { Fragment, type PropsWithChildren } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';

import { useColorScheme } from '@/hooks/useColorScheme';
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
  const colorScheme = useColorScheme();

  return <Fragment key={colorScheme}>{children}</Fragment>;
};

export default AppTamaguiProvider;
