import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { COLORS } from './colors';

const NAV_THEME = {
  light: {
    ...DefaultTheme,
    colors: {
      background: COLORS.light.background,
      border: COLORS.light.grey,
      card: COLORS.light.card,
      notification: COLORS.light.grey,
      primary: COLORS.light.primary,
      text: COLORS.black,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: COLORS.dark.background,
      border: COLORS.dark.grey,
      card: COLORS.dark.grey,
      notification: COLORS.dark.grey,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
  },
};

export { NAV_THEME };
