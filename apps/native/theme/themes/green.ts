import { palette } from '@/theme/tokens';

import { commonStatusFilterColors, commonTheme } from './common';
import { type ThemeContract } from './theme.contract';

export const greenTheme: ThemeContract = {
  ...commonTheme,
  name: 'green',
  colors: {
    ...commonTheme.colors,
    action: {
      ...commonTheme.colors.action,
      primary: {
        ...commonTheme.colors.action.primary,
        default: palette.theme.green[50],
      },
    },
    feedback: {
      ...commonTheme.colors.feedback,
      info: {
        ...commonTheme.colors.feedback.info,
        text: palette.theme.softGreen[50],
        border: palette.theme.softGreen[50],
        bg: palette.theme.green[80],
      },
    },
    background: {
      ...commonTheme.colors.background,
      base: palette.theme.green[10],
    },
    text: {
      ...commonTheme.colors.text,
      secondary: palette.theme.softGreen[40],
      tertiary: palette.theme.softGreen[80],
      muted: palette.theme.green[80],
      soft: palette.theme.softGreen[60],
    },
    filter: {
      ...commonTheme.colors.filter,
      status: {
        ...commonStatusFilterColors,
        inactiveBorder: palette.theme.softGreen[50],
        inactiveText: palette.theme.softGreen[50],
      },
    },
    field: {
      ...commonTheme.colors.field,
      required: palette.theme.green[50],
      optional: palette.theme.softGreen[50],
      icon: palette.theme.green[50],
    },
    brand: {
      ...commonTheme.colors.brand,
      primary: palette.theme.green[30],
      secondary: palette.theme.green[20],
      background: palette.theme.green[10],
      text: palette.theme.green[100],
      icon: palette.theme.green[50],
      check: palette.theme.green[90],
      selectedCheckbox: palette.theme.green[30],
      selectedCheck: palette.theme.green[100],
      todaySuccessCheckbox: palette.theme.green[10],
      todaySuccessCheck: palette.theme.green[80],
      bottomTab: palette.theme.softGreen[20],
      activeBottomTab: palette.theme.green[50],
      card: palette.theme.green[5],
      routineBackground: palette.theme.green[100],
    },
  },
};
