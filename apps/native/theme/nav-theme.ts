import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { darkTheme, lightTheme, blueTheme } from './themes';
import { palette } from './tokens';

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
  blue: {
    ...DefaultTheme,
    colors: {
      background: blueTheme.colors.brand.background,
      border: blueTheme.colors.brand.grey,
      card: blueTheme.colors.brand.grey,
      notification: blueTheme.colors.brand.grey,
      primary: blueTheme.colors.brand.primary,
      text: blueTheme.colors.brand.text,
    },
  },
};
