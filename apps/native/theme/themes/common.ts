import { palette } from '@/theme/tokens';

import { baseTheme, type ThemeContract } from './theme.contract';

export const commonStatusFilterColors = {
  activeBackground: palette.white,
  activeBorder: palette.theme.gray[60],
  activeText: palette.theme.gray[60],
  inactiveBorder: palette.theme.softBlue[50],
  inactiveText: palette.theme.softBlue[50],
} as const;

export const commonTheme: ThemeContract = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    border: {
      ...baseTheme.colors.border,
      input: palette.theme.gray[50],
    },
    field: {
      ...baseTheme.colors.field,
      label: palette.theme.gray[70],
      required: palette.theme.blue[50],
      optional: palette.theme.gray[10],
      placeholder: palette.theme.gray[10],
      text: palette.theme.gray[70],
      icon: palette.theme.blue[50],
      border: palette.theme.gray[70],
      background: palette.white,
    },
    filter: {
      status: commonStatusFilterColors,
    },
    background: {
      ...baseTheme.colors.background,
      input: palette.white,
    },
    questDetail: {
      periodBackground: palette.theme.gray[95],
      periodText: palette.theme.gray[10],
    },
    text: {
      ...baseTheme.colors.text,
      primary: palette.white,

      gray: palette.theme.gray[90],
      title: palette.theme.gray[90],
      pageHeaderTitle: palette.theme.gray[90],
      label: palette.theme.gray[70],
      input: palette.theme.gray[70],
    },
    brand: {
      ...baseTheme.colors.brand,
      checkbox: palette.theme.gray[95],
    },
  },
};
