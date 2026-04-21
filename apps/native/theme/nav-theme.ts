import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { palette } from './tokens';
import { darkTheme, lightTheme } from './themes';

export const NAV_THEME = {
  light: {
    ...DefaultTheme,
    colors: {
      background: lightTheme.colors.brand.background,
      border: lightTheme.colors.brand.grey,
      card: lightTheme.colors.brand.card,
      notification: lightTheme.colors.brand.grey,
      primary: lightTheme.colors.brand.primary,
      text: palette.black,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: darkTheme.colors.brand.background,
      border: darkTheme.colors.brand.grey,
      card: darkTheme.colors.brand.grey,
      notification: darkTheme.colors.brand.grey,
      primary: darkTheme.colors.brand.primary,
      text: palette.white,
    },
  },
};
