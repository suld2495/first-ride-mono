import { palette } from '@/theme/tokens';

import { commonTheme } from './common';
import { type ThemeContract } from './theme.contract';

export const redTheme: ThemeContract = {
  ...commonTheme,
  name: 'red',
  colors: {
    ...commonTheme.colors,
    action: {
      ...commonTheme.colors.action,
      primary: {
        ...commonTheme.colors.action.primary,
        default: palette.theme.red[50],
      },
    },
    feedback: {
      ...commonTheme.colors.feedback,
      info: {
        ...commonTheme.colors.feedback.info,
        text: palette.theme.softRed[50],
        border: palette.theme.softRed[50],
        bg: palette.theme.red[80],
      },
    },
    background: {
      ...commonTheme.colors.background,
      base: palette.theme.red[10],
    },
    text: {
      ...commonTheme.colors.text,
      secondary: palette.theme.softRed[40],
      tertiary: palette.theme.softRed[80],
    },
    brand: {
      ...commonTheme.colors.brand,
      primary: palette.theme.red[30],
      background: palette.theme.red[10],
      text: palette.theme.red[100],
      icon: palette.theme.red[50],
      check: palette.theme.red[90],
      selectedCheckbox: palette.theme.red[30],
      selectedCheck: palette.theme.red[100],
      bottomTab: palette.theme.softRed[20],
      activeBottomTab: palette.theme.red[50],
      routineBackground: palette.theme.red[100],
    },
  },
};
