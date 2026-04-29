import { palette } from '@/theme/tokens';

import { baseTheme, type ThemeContract } from './theme.contract';

export const blueTheme: ThemeContract = {
  ...baseTheme,
  name: 'blue',
  colors: {
    ...baseTheme.colors,
    text: {
      ...baseTheme.colors.text,
      secondary: palette.skinSoftBlue[40],
      tertiary: palette.skinSoftBlue[80],
      gray: palette.skinGray[90],
    },
    brand: {
      ...baseTheme.colors.brand,
      primary: palette.skinBlue[30],
      background: palette.skinBlue[10],
      text: palette.skinBlue[100],
      icon: palette.skinBlue[50],
      checkbox: palette.skinGray[95],
      check: palette.skinBlue[90],
      selectedCheckbox: palette.skinBlue[30],
      selectedCheck: palette.skinBlue[100],
      bottomTab: palette.skinSoftBlue[20],
    },
  },
};
