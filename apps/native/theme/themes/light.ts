import { palette } from '@/theme/tokens';

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
      base: palette.stitch.light.bg,
      surface: palette.stitch.light.surface,
      elevated: palette.stitch.light.surface,
      sunken: '#f1f5f9',
      overlay: 'rgba(15, 23, 42, 0.5)',
    },
    text: {
      primary: palette.stitch.light.text,
      secondary: palette.stitch.light.secondary,
      tertiary: '#94a3b8',
      disabled: '#cbd5e1',
      inverse: '#FFFFFF',
      link: palette.stitch.primary,
    },
    action: {
      primary: {
        default: palette.stitch.primary,
        pressed: '#0f0fdb',
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
      default: palette.stitch.light.border,
      strong: '#e2e8f0',
      subtle: '#f8fafc',
      focus: palette.stitch.primary,
      divider: '#f1f5f9',
    },
    brand: {
      grey: '#636e72',
      background: '#F5F7FA',
      backgroundGrey: '#FFFFFF',
      primary: '#0984e3',
      text: '#2D3436',
      textSecondary: '#636e72',
      icon: '#2D3436',
      button: '#0984e3',
      buttonLight: '#FFFFFF',
      subButton: '#b2bec3',
      checkbox: '#0984e3',
      input: '#F5F7FA',
      error: '#d63031',
      success: '#00b894',
      warning: '#fdcb6e',
      info: '#0984e3',
      border: '#2D3436',
      boxShadow: '0 4px 0 rgba(45, 52, 54, 0.5)',
      foreground: '#2D3436',
      root: '#F5F7FA',
      card: '#FFFFFF',
    },
  },
};
