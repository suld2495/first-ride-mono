import { palette } from '@/theme/tokens';

import { baseTheme, type ThemeContract } from './theme.contract';

export const commonTheme: ThemeContract = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    border: {
      ...baseTheme.colors.border,
      input: palette.theme.gray[50],
    },
    background: {
      ...baseTheme.colors.background,
      input: palette.white,
    },
    text: {
      ...baseTheme.colors.text,
      primary: palette.white,

      gray: palette.theme.gray[90],
      title: palette.theme.gray[90],
      label: palette.theme.gray[70],
      input: palette.theme.gray[70],
    },
    brand: {
      ...baseTheme.colors.brand,
      checkbox: palette.theme.gray[95],
    },
  },
};
