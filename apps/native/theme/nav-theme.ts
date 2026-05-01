import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import {
  darkTheme,
  lightTheme,
  blueTheme,
  greenTheme,
  redTheme,
} from './themes';
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
  green: {
    ...DefaultTheme,
    colors: {
      background: greenTheme.colors.brand.background,
      border: greenTheme.colors.brand.grey,
      card: greenTheme.colors.brand.grey,
      notification: greenTheme.colors.brand.grey,
      primary: greenTheme.colors.brand.primary,
      text: greenTheme.colors.brand.text,
    },
  },
  red: {
    ...DefaultTheme,
    colors: {
      background: redTheme.colors.brand.background,
      border: redTheme.colors.brand.grey,
      card: redTheme.colors.brand.grey,
      notification: redTheme.colors.brand.grey,
      primary: redTheme.colors.brand.primary,
      text: redTheme.colors.brand.text,
    },
  },
};
