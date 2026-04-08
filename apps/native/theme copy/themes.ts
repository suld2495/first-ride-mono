import { tokens } from './tokens';

export const themes = {
  light: {
    background: tokens.color.canvas,
    color: tokens.color.ink,
    muted: tokens.color.muted,
    panel: tokens.color.panel,
    panelBorder: tokens.color.panelBorder,
    accentBackground: tokens.color.accentBackground,
    accentForeground: tokens.color.accentForeground,
    accentSecondary: tokens.color.accentSecondary,
    glow: tokens.color.glow,
    shadowColor: tokens.color.shadow,
  },
  dark: {
    background: tokens.color.canvasDark,
    color: tokens.color.inkDark,
    muted: tokens.color.mutedDark,
    panel: tokens.color.panelDark,
    panelBorder: tokens.color.panelBorderDark,
    accentBackground: tokens.color.accentBackgroundDark,
    accentForeground: tokens.color.accentForegroundDark,
    accentSecondary: tokens.color.accentSecondaryDark,
    glow: tokens.color.glowDark,
    shadowColor: tokens.color.shadowDark,
  },
} as const;
