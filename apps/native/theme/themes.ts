import { darkTheme } from '@/styles/themes/dark';
import { lightTheme } from '@/styles/themes/light';

const mapTheme = (
  theme: typeof lightTheme | typeof darkTheme,
  mode: 'light' | 'dark',
) => ({
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
} as const;
