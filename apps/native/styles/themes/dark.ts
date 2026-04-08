/**
 * Dark Theme
 */

import { palette } from '@/styles/tokens/palette';

import type { ThemeContract } from './theme.contract';

export const darkTheme: ThemeContract = {
  name: 'dark',

  density: 'comfortable',
  radiusStyle: 'rounded',
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    scale: 1,
  },

  colors: {
    background: {
      base: palette.stitch.dark.bg, // Deep Navy/Black
      surface: palette.stitch.dark.surface, // Slate 800
      elevated: palette.stitch.dark.surface,
      sunken: '#0f172a', // Slate 900
      overlay: 'rgba(0, 0, 0, 0.7)',
    },

    text: {
      primary: palette.stitch.dark.text, // Slate 50
      secondary: palette.stitch.dark.secondary, // Slate 400
      tertiary: '#64748b', // Slate 500
      disabled: '#334155',
      inverse: '#0f172a',
      link: palette.stitch.primary,
    },

    action: {
      primary: {
        default: palette.stitch.primary,
        pressed: '#1f1fff', // Slightly lighter blue for dark mode
        disabled: '#334155',
        label: '#FFFFFF',
      },
      secondary: {
        default: palette.blue[900],
        pressed: palette.blue[800],
        disabled: palette.gray[800],
        label: palette.blue[300],
      },
      ghost: {
        default: 'transparent',
        pressed: palette.gray[800],
        disabled: 'transparent',
        label: palette.gray[300],
      },
    },

    feedback: {
      success: {
        bg: palette.green[900],
        text: palette.green[300],
        border: palette.green[700],
      },
      error: {
        bg: palette.red[900],
        text: palette.red[300],
        border: palette.red[700],
      },
      warning: {
        bg: palette.yellow[900],
        text: palette.yellow[300],
        border: palette.yellow[700],
      },
      info: {
        bg: palette.blue[900],
        text: palette.blue[300],
        border: palette.blue[700],
      },
    },

    border: {
      default: palette.stitch.dark.border, // Slate 700
      strong: '#475569', // Slate 600
      subtle: '#1e293b',
      focus: palette.stitch.primary,
      divider: '#334155',
    },
  },
};
