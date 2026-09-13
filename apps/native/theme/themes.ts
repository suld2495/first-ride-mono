import { blueTheme } from './themes/blue';
import { darkTheme } from './themes/dark';
import { greenTheme } from './themes/green';
import { lightTheme } from './themes/light';
import { withNeutralSurface } from './themes/neutral-surface';
import { redTheme } from './themes/red';
import { type ThemeContract } from './themes/theme.contract';

export type {
  ThemeContract,
  ThemeDensity,
  ThemeRadiusStyle,
} from './themes/theme.contract';
export { darkTheme, lightTheme, blueTheme, greenTheme, redTheme };

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  red: redTheme,
} as const;

export type ThemeName = keyof typeof appThemes;

/** 홈 외 화면에서 쓰는 중립 표면 버전. 테마 이름은 원본과 같다. */
export const neutralAppThemes = {
  light: withNeutralSurface(lightTheme),
  dark: withNeutralSurface(darkTheme),
  blue: withNeutralSurface(blueTheme),
  green: withNeutralSurface(greenTheme),
  red: withNeutralSurface(redTheme),
} as const satisfies Record<ThemeName, ThemeContract>;

export type NeutralThemeName = `${ThemeName}Neutral`;

export const getNeutralThemeName = (name: ThemeName): NeutralThemeName =>
  `${name}Neutral`;

const mapTheme = (theme: ThemeContract, mode: ThemeName) => ({
  background: theme.colors.background.base,
  backgroundHover: theme.colors.background.surface,
  backgroundPress: theme.colors.background.elevated,
  backgroundFocus: theme.colors.background.surface,
  color: theme.colors.text.primary,
  colorHover: theme.colors.text.primary,
  colorPress: theme.colors.text.secondary,
  borderColor: theme.colors.border.default,
  borderColorHover: theme.colors.border.strong,
  borderColorFocus: theme.colors.border.focus,
  placeholderColor: theme.colors.text.tertiary,
  surface: theme.colors.background.surface,
  surfaceHover: theme.colors.background.elevated,
  surfacePress: theme.colors.background.sunken,
  textPrimary: theme.colors.text.primary,
  textSecondary: theme.colors.text.secondary,
  textTertiary: theme.colors.text.tertiary,
  textMuted: theme.colors.text.muted,
  textSoft: theme.colors.text.soft,
  textInverse: theme.colors.text.inverse,
  textLink: theme.colors.text.link,
  primary: theme.colors.action.primary.default,
  primaryPress: theme.colors.action.primary.pressed,
  primaryLabel: theme.colors.action.primary.label,
  secondary: theme.colors.action.secondary.default,
  secondaryPress: theme.colors.action.secondary.pressed,
  secondaryLabel: theme.colors.action.secondary.label,
  ghost: theme.colors.action.ghost.default,
  ghostPress: theme.colors.action.ghost.pressed,
  ghostLabel: theme.colors.action.ghost.label,
  danger: theme.colors.feedback.error.bg,
  dangerPress:
    mode === 'light'
      ? theme.colors.feedback.error.border
      : theme.colors.feedback.error.text,
  dangerLabel: theme.colors.feedback.error.text,
  success: theme.colors.feedback.success.text,
  warning: theme.colors.feedback.warning.text,
  info: theme.colors.feedback.info.text,
  overlay: theme.colors.background.overlay,
});

export const themes = {
  light: mapTheme(lightTheme, 'light'),
  dark: mapTheme(darkTheme, 'dark'),
  blue: mapTheme(blueTheme, 'blue'),
  green: mapTheme(greenTheme, 'green'),
  red: mapTheme(redTheme, 'red'),
  lightNeutral: mapTheme(neutralAppThemes.light, 'light'),
  darkNeutral: mapTheme(neutralAppThemes.dark, 'dark'),
  blueNeutral: mapTheme(neutralAppThemes.blue, 'blue'),
  greenNeutral: mapTheme(neutralAppThemes.green, 'green'),
  redNeutral: mapTheme(neutralAppThemes.red, 'red'),
} as const;
