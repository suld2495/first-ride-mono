import { palette } from '@/theme/tokens';

import { baseTheme, type ThemeContract } from './theme.contract';

export const blueTheme: ThemeContract = {
  ...baseTheme,
  name: 'blue',
  colors: {
    ...baseTheme.colors,
    border: {
      ...baseTheme.colors.border,
      input: palette.skinGray[50],
    },
    action: {
      ...baseTheme.colors.action,
      primary: {
        ...baseTheme.colors.action.primary,
        default: palette.skinBlue[50],
      },
    },
    feedback: {
      ...baseTheme.colors.feedback,
      info: {
        ...baseTheme.colors.feedback.info,
        text: palette.skinSoftBlue[50],
        border: palette.skinSoftBlue[50],
        bg: palette.skinBlue[80],
      },
    },
    background: {
      ...baseTheme.colors.background,
      base: palette.skinBlue[10],
      input: palette.white,
    },
    text: {
      ...baseTheme.colors.text,
      primary: palette.white,
      secondary: palette.skinSoftBlue[40],
      tertiary: palette.skinSoftBlue[80],
      gray: palette.skinGray[90],
      title: palette.skinGray[90],
      label: palette.skinGray[70],
      input: palette.skinGray[70],
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
