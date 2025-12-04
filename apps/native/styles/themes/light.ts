/**
 * Light Theme
 */

import { palette } from '../tokens/palette';

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
      base: palette.white,
      surface: palette.gray[50],
      elevated: palette.white,
      sunken: palette.gray[100],
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    text: {
      primary: palette.gray[900],
      secondary: palette.gray[600],
      tertiary: palette.gray[400],
      disabled: palette.gray[300],
      inverse: palette.white,
      link: palette.blue[600],
    },

    action: {
      primary: {
        default: palette.blue[600],
        pressed: palette.blue[800],
        disabled: palette.gray[300],
        label: palette.white,
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
      default: palette.gray[300],
      strong: palette.gray[500],
      subtle: palette.gray[200],
      focus: palette.blue[500],
      divider: palette.gray[200],
    },
  },
};
