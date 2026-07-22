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
      media: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      muted: string;
      soft: string;
      disabled: string;
      inverse: string;
      link: string;
      gray: string;
      title: string;
      pageHeaderTitle: string;
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
    tag: {
      critical: {
        700: string;
      };
    };
    border: {
      default: string;
      strong: string;
      subtle: string;
      focus: string;
      divider: string;
      input: string;
    };
    field: {
      label: string;
      required: string;
      optional: string;
      placeholder: string;
      text: string;
      icon: string;
      border: string;
      background: string;
    };
    filter?: {
      status: {
        activeBackground: string;
        activeBorder: string;
        activeText: string;
        inactiveBorder: string;
        inactiveText: string;
      };
    };
    questDetail: {
      periodBackground: string;
      periodText: string;
    };
    brand: {
      grey: string;
      background: string;
      backgroundGrey: string;
      primary: string;
      secondary: string;
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
      todaySuccessCheckbox: string;
      todaySuccessCheck: string;
      pendingConfirmationCheckbox: string;
      pendingConfirmationCheck: string;
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
      activeBottomTab: string;
      routineBorder: string;
      routineBackground: string;
      routineMissedCheckbox: string;
      routineUpcomingCheckboxBorder: string;
    };
  };
};

export const baseTheme: ThemeContract = {
  name: 'dark',
  density: 'comfortable',
  radiusStyle: 'rounded',
  typography: {
    fontFamily: {
      regular: 'Pretendard-Regular',
      medium: 'Pretendard-Medium',
      bold: 'Pretendard-Bold',
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
      media: palette.stitch.dark.surface,
    },
    text: {
      primary: palette.stitch.dark.text,
      secondary: palette.stitch.dark.secondary,
      tertiary: '#64748b',
      muted: '#64748b',
      soft: '#64748b',
      disabled: '#334155',
      inverse: '#0f172a',
      link: palette.stitch.primary,
      gray: palette.theme.gray[5],
      title: palette.theme.gray[5],
      pageHeaderTitle: palette.theme.gray[5],
      label: palette.theme.gray[5],
      input: palette.theme.gray[5],
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
        disabled: palette.theme.gray[40],
        label: palette.blue[300],
      },
      ghost: {
        default: 'transparent',
        pressed: palette.theme.gray[40],
        disabled: 'transparent',
        label: palette.theme.gray[8],
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
    tag: {
      critical: {
        700: palette.tag.critical[700],
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
    field: {
      label: palette.theme.gray[5],
      required: palette.stitch.primary,
      optional: palette.theme.gray[10],
      placeholder: palette.theme.gray[10],
      text: palette.theme.gray[5],
      icon: palette.stitch.primary,
      border: palette.theme.gray[70],
      background: palette.white,
    },
    questDetail: {
      periodBackground: palette.theme.gray[95],
      periodText: palette.theme.gray[10],
    },
    brand: {
      grey: '#b2bec3',
      background: '#1e272e',
      backgroundGrey: '#2f3640',
      primary: '#0984e3',
      secondary: '#0984e3',
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
      todaySuccessCheckbox: palette.theme.blue[10],
      todaySuccessCheck: palette.theme.blue[80],
      pendingConfirmationCheckbox: palette.yellow[900],
      pendingConfirmationCheck: palette.yellow[300],
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
      activeBottomTab: '#2f3640',
      routineBorder: palette.theme.blue[80],
      routineBackground: '#2f3640',
      routineMissedCheckbox: palette.theme.blue[90],
      routineUpcomingCheckboxBorder: palette.theme.softBlue[80],
    },
  },
};
