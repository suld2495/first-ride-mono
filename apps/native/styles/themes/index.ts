/**
 * Themes Export
 */

import { darkTheme } from './dark';
import { lightTheme } from './light';

export { darkTheme, lightTheme };
export type {
  ThemeContract,
  ThemeDensity,
  ThemeRadiusStyle,
} from './theme.contract';

// 사용 가능한 스킨 목록
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;
