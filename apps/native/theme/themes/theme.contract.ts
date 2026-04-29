import { palette } from '@/theme/tokens';

export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';
export type ThemeRadiusStyle = 'sharp' | 'rounded' | 'pill';

export type ThemeContract = {
  name: string;
  density?: ThemeDensity;
  radiusStyle?: ThemeRadiusStyle;
  typography?: {
    fontFamily?: {
      regular: string;
      medium?: string;
      bold?: string;
    };
    scale?: number;
  };
  colors: {
    background: {
      base: string;
      surface: string;
      elevated: string;
      sunken: string;
      overlay: string;
      input: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
      link: string;
      gray: string;
      title: string;
      label: string;
      input: string;
    };
    action: {
      primary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      secondary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      ghost: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
    };
    feedback: {
      success: { bg: string; text: string; border: string };
      error: { bg: string; text: string; border: string };
      warning: { bg: string; text: string; border: string };
      info: { bg: string; text: string; border: string };
    };
    border: {
      default: string;
      strong: string;
      subtle: string;
      focus: string;
      divider: string;
      input: string;
    };
    brand: {
      grey: string;
      background: string;
      backgroundGrey: string;
      primary: string;
      text: string;
      textSecondary: string;
      icon: string;
      button: string;
      buttonLight: string;
      subButton: string;
      checkbox: string;
      check: string;
      selectedCheckbox: string;
      selectedCheck: string;
      input: string;
      error: string;
      success: string;
      warning: string;
      info: string;
      border: string;
      boxShadow: string;
      foreground: string;
      root: string;
      card: string;
      bottomTab: string;
    };
  };
};

export const baseTheme: ThemeContract = {
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
      base: palette.stitch.dark.bg,
      surface: palette.stitch.dark.surface,
      elevated: palette.stitch.dark.surface,
      sunken: '#0f172a',
      overlay: 'rgba(0, 0, 0, 0.7)',
      input: palette.white,
    },
    text: {
      primary: palette.stitch.dark.text,
      secondary: palette.stitch.dark.secondary,
      tertiary: '#64748b',
      disabled: '#334155',
      inverse: '#0f172a',
      link: palette.stitch.primary,
      gray: palette.gray[100],
      title: palette.gray[100],
      label: palette.gray[100],
      input: palette.gray[100],
    },
    action: {
      primary: {
        default: palette.stitch.primary,
        pressed: '#1f1fff',
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
      default: palette.stitch.dark.border,
      strong: '#475569',
      subtle: '#1e293b',
      focus: palette.stitch.primary,
      divider: '#334155',
      input: '#475569',
    },
    brand: {
      grey: '#b2bec3',
      background: '#1e272e',
      backgroundGrey: '#2f3640',
      primary: '#0984e3',
      text: '#d2dae2',
      textSecondary: '#a4b0be',
      icon: '#d2dae2',
      button: '#0984e3',
      buttonLight: '#2f3640',
      subButton: '#485460',
      checkbox: '#0984e3',
      check: '#0984e3',
      selectedCheckbox: '#0984e3',
      selectedCheck: '#0984e3',
      input: '#1e272e',
      error: '#d63031',
      success: '#00b894',
      warning: '#fdcb6e',
      info: '#0984e3',
      border: '#d2dae2',
      boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
      foreground: '#d2dae2',
      root: '#1e272e',
      card: '#2f3640',
      bottomTab: '#2f3640',
    },
  },
};
