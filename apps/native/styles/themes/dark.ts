/**
 * Dark Theme
 */

import { palette } from '../tokens/palette';

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
      base: palette.gray[900],
      surface: palette.gray[800],
      elevated: palette.gray[800],
      sunken: palette.black,
      overlay: 'rgba(0, 0, 0, 0.7)',
    },

    text: {
      primary: palette.gray[50],
      secondary: palette.gray[400],
      tertiary: palette.gray[600],
      disabled: palette.gray[700],
      inverse: palette.gray[900],
      link: palette.blue[400],
    },

    action: {
      primary: {
        default: palette.blue[500],
        pressed: palette.blue[600],
        disabled: palette.gray[700],
        label: palette.white,
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
      default: palette.gray[700],
      strong: palette.gray[500],
      subtle: palette.gray[800],
      focus: palette.blue[400],
      divider: palette.gray[700],
    },
  },
};
