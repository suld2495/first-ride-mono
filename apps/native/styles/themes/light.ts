/**
 * Light Theme
 */

import { palette } from '@/styles/tokens/palette';

import type { ThemeContract } from './theme.contract';

export const lightTheme: ThemeContract = {
  name: 'light',

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
      base: palette.stitch.light.bg, // Soft Gray/White
      surface: palette.stitch.light.surface, // Pure White
      elevated: palette.stitch.light.surface,
      sunken: '#f1f5f9', // Slate 100
      overlay: 'rgba(15, 23, 42, 0.5)', // Slate 900 overlay
    },

    text: {
      primary: palette.stitch.light.text, // Slate 900
      secondary: palette.stitch.light.secondary, // Slate 500
      tertiary: '#94a3b8', // Slate 400
      disabled: '#cbd5e1',
      inverse: '#FFFFFF',
      link: palette.stitch.primary,
    },

    action: {
      primary: {
        default: palette.stitch.primary,
        pressed: '#0f0fdb', // Slightly darker blue
        disabled: '#cbd5e1',
        label: '#FFFFFF',
      },
      secondary: {
        default: palette.blue[50],
        pressed: palette.blue[100],
        disabled: palette.gray[100],
        label: palette.blue[700],
      },
      ghost: {
        default: 'transparent',
        pressed: palette.gray[100],
        disabled: 'transparent',
        label: palette.gray[700],
      },
    },

    feedback: {
      success: {
        bg: palette.green[50],
        text: palette.green[700],
        border: palette.green[200],
      },
      error: {
        bg: palette.red[50],
        text: palette.red[700],
        border: palette.red[200],
      },
      warning: {
        bg: palette.yellow[50],
        text: palette.yellow[900],
        border: palette.yellow[200],
      },
      info: {
        bg: palette.blue[50],
        text: palette.blue[700],
        border: palette.blue[200],
      },
    },

    border: {
      default: palette.stitch.light.border, // Slate 100
      strong: '#e2e8f0', // Slate 200
      subtle: '#f8fafc',
      focus: palette.stitch.primary,
      divider: '#f1f5f9',
    },
  },
};
