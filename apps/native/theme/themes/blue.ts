import { palette } from '@/theme/tokens';

import { commonStatusFilterColors, commonTheme } from './common';
import { type ThemeContract } from './theme.contract';

export const blueTheme: ThemeContract = {
  ...commonTheme,
  name: 'blue',
  colors: {
    ...commonTheme.colors,
    action: {
      ...commonTheme.colors.action,
      primary: {
        ...commonTheme.colors.action.primary,
        default: palette.theme.blue[50],
      },
    },
    feedback: {
      ...commonTheme.colors.feedback,
      info: {
        ...commonTheme.colors.feedback.info,
        text: palette.theme.softBlue[50],
        border: palette.theme.softBlue[50],
        bg: palette.theme.blue[80],
      },
    },
    background: {
      ...commonTheme.colors.background,
      base: palette.theme.blue[10],
    },
    text: {
      ...commonTheme.colors.text,
      secondary: palette.theme.softBlue[40],
      tertiary: palette.theme.softBlue[80],
      muted: palette.theme.blue[80],
      soft: palette.theme.softBlue[60],
    },
    filter: {
      ...commonTheme.colors.filter,
      status: {
        ...commonStatusFilterColors,
        inactiveBorder: palette.theme.softBlue[50],
        inactiveText: palette.theme.softBlue[50],
      },
    },
    field: {
      ...commonTheme.colors.field,
      required: palette.theme.blue[50],
      optional: palette.theme.softBlue[50],
      icon: palette.theme.blue[50],
    },
    brand: {
      ...commonTheme.colors.brand,
      primary: palette.theme.blue[30],
      secondary: palette.theme.blue[20],
      background: palette.theme.blue[10],
      text: palette.theme.blue[100],
      icon: palette.theme.blue[50],
      check: palette.theme.blue[90],
      selectedCheckbox: palette.theme.blue[30],
      selectedCheck: palette.theme.blue[100],
      todaySuccessCheckbox: palette.theme.blue[10],
      todaySuccessCheck: palette.theme.blue[80],
      bottomTab: palette.theme.softBlue[20],
      activeBottomTab: palette.theme.blue[50],
      card: palette.theme.blue[5],
      routineBorder: palette.theme.blue[80],
      routineBackground: palette.theme.blue[100],
      routineMissedCheckbox: palette.theme.blue[90],
      routineUpcomingCheckboxBorder: palette.theme.softBlue[80],
      routineProgressText: palette.theme.softBlue[50],
    },
  },
};
