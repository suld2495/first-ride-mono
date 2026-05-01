import { createTokens } from 'tamagui';

import type { ResponsiveValue } from '@/theme/responsive';
import type { ThemeContract } from '@/theme/themes';

export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  theme: {
    softBlue: {
      20: '#A7CBEA',
      40: '#83B0D6',
      50: '#72A4CF',
      80: '#4C769C',
    },

    blue: {
      5: '#E2F1FF',
      10: '#B0DAFF',
      20: '#A3D4FF', // 임시
      30: '#7FC3FF',
      50: '#107AD6',
      80: '#2C5171',
      90: '#16334C',
      100: '#001A31',
    },

    softRed: {
      20: '#E1C6DB',
      40: '#83B0D6', // 임시
      50: '#CF93C1',
      80: '#4C769C', // 임시
    },

    red: {
      5: '#FFEBFA',
      10: '#F9DCF2',
      20: '#F5C8EA', // 임시
      30: '#FFA3E9',
      50: '#C73FA7',
      80: '#7A486E',
      90: '#16334C', // 임시
      100: '#3A040C',
    },

    softGreen: {
      20: '#84D4A9',
      40: '#83B0D6', // 임시
      50: '#7FA892',
      80: '#4C769C', // 임시
    },

    green: {
      5: '#D4FFE9',
      10: '#B9E9CF',
      20: '#8EDFB5', // 임시
      30: '#49E191',
      50: '#199453',
      80: '#416B58',
      90: '#16334C', // 임시
      100: '#05261D',
    },

    gray: {
      50: '#363A3F',
      70: '#272A2D',
      90: '#18191B',
      95: '#000306',
    },
  },

  blue: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  green: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  yellow: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B',
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17',
  },

  rpg: {
    strength: '#e74c3c',
    agility: '#2ecc71',
    intelligence: '#3498db',
    luck: '#f1c40f',
    vitality: '#e91e63',
    mana: '#9b59b6',
    exp: '#ffd700',
    frame: '#8b7355',
    frameDark: '#5d4e37',
  },
  retro: {
    neolight: {
      bg: '#F5F7FA',
      surface: '#FFFFFF',
      border: '#2D3436',
      text: '#2D3436',
      highlight: '#DFE6E9',
    },
    neodark: {
      bg: '#1e272e',
      surface: '#2f3640',
      border: '#d2dae2',
      text: '#d2dae2',
      highlight: '#485460',
    },
    primary: '#0984e3',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#d63031',
    accent: '#6c5ce7',
  },
  stitch: {
    primary: '#1313ec',
    light: {
      bg: '#f6f6f8',
      surface: '#FFFFFF',
      border: '#f1f5f9',
      text: '#0f172a',
      secondary: '#64748b',
    },
    dark: {
      bg: '#101022',
      surface: '#1e293b',
      border: '#334155',
      text: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
} as const;

export const baseFoundation = {
  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    s: 8,
    sm: 12,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    none: 0,
    xs: 8,
    s: 12,
    m: 16,
    l: 24,
    xl: 32,
    round: 9999,
  },
  typography: {
    size: {
      caption3: 11,
      caption2: 12,
      caption1: 13,
      body3: 14,
      body2: 15,
      body1: 16,
      subtitle2: 18,
      subtitle1: 20,
      title: 22,
      h3: 24,
      h2: 28,
      h1: 32,
      h0: 40,
      xs: 11,
      s: 12,
      m: 14,
      l: 16,
      xl: 20,
      xxl: 24,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadow: {
    s: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    m: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    l: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },
  motion: {
    duration: {
      instant: 100,
      fast: 150,
      normal: 250,
      slow: 400,
      slower: 600,
    },
    easing: {
      linear: [0, 0, 1, 1] as const,
      easeIn: [0.4, 0, 1, 1] as const,
      easeOut: [0, 0, 0.2, 1] as const,
      easeInOut: [0.4, 0, 0.2, 1] as const,
    },
  },
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
  },
  breakpoints: {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  opacity: {
    transparent: 0,
    disabled: 0.4,
    subtle: 0.6,
    medium: 0.8,
    solid: 1,
  },
  dimension: {
    x0: 0,
    x1: 1,
    x2: 2,
    x3: 3,
    x4: 4,
    x5: 5,
    x6: 6,
    x7: 7,
    x8: 8,
    x9: 9,
    x10: 10,
    x11: 11,
    x12: 12,
    x13: 13,
    x14: 14,
    x16: 16,
    x18: 18,
    x20: 20,
    x22: 22,
    x24: 24,
    x28: 28,
    x30: 30,
    x32: 32,
    x36: 36,
    x40: 40,
    x44: 44,
    x48: 48,
    x50: 50,
    x52: 52,
    x56: 56,
    x58: 58,
    x60: 60,
    x72: 72,
    x80: 80,
    x84: 84,
    x100: 100,
    x112: 112,
    x120: 120,
    x140: 140,
    x180: 180,
    x220: 220,
    x250: 250,
    x320: 320,
  },
  iconSize: {
    xs: 12,
    s: 16,
    m: 20,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  responsive: {
    containerPadding: { xs: 16, md: 24, xl: 32 } as ResponsiveValue<number>,
    sectionGap: { xs: 24, md: 40, lg: 56 } as ResponsiveValue<number>,
    gridGutter: { xs: 12, md: 20 } as ResponsiveValue<number>,
    maxContentWidth: {
      xs: -1,
      md: 720,
      lg: 960,
      xl: 1200,
    } as ResponsiveValue<number>,
    pageTitle: { xs: 24, md: 32, lg: 40 } as ResponsiveValue<number>,
    sectionTitle: { xs: 18, md: 22 } as ResponsiveValue<number>,
  },
} as const;

export const createFoundation = (theme: ThemeContract) => {
  const densityScale =
    theme.density === 'compact'
      ? 0.85
      : theme.density === 'spacious'
        ? 1.15
        : 1;

  const typographyScale = theme.typography?.scale ?? 1;

  const spacing = Object.fromEntries(
    Object.entries(baseFoundation.spacing).map(([k, v]) => [
      k,
      (v as number) * densityScale,
    ]),
  ) as typeof baseFoundation.spacing;

  type RadiiType = {
    none: number;
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    round: number;
  };

  const radii: RadiiType = (() => {
    if (theme.radiusStyle === 'sharp') {
      return {
        ...baseFoundation.radii,
        xs: 0,
        s: 0,
        m: 0,
        l: 0,
      };
    }

    if (theme.radiusStyle === 'pill') {
      return {
        ...baseFoundation.radii,
        s: 9999,
        m: 9999,
        l: 9999,
      };
    }

    return { ...baseFoundation.radii };
  })();

  const typography = {
    ...baseFoundation.typography,
    size: Object.fromEntries(
      Object.entries(baseFoundation.typography.size).map(([k, v]) => [
        k,
        (v as number) * typographyScale,
      ]),
    ) as typeof baseFoundation.typography.size,
    fontFamily: theme.typography?.fontFamily ?? {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
  };

  const {
    shadow,
    motion,
    zIndex,
    breakpoints,
    opacity,
    dimension,
    iconSize,
    responsive,
  } = baseFoundation;

  return {
    spacing,
    radii,
    typography,
    shadow,
    motion,
    zIndex,
    breakpoints,
    opacity,
    dimension,
    iconSize,
    responsive,
  } as const;
};

export const spacing = (multiplier: number) =>
  baseFoundation.spacing.m * multiplier;

export const tokens = createTokens({
  color: {
    white: '#FFFFFF',
    black: '#000000',
    true: palette.stitch.light.text,
  },
  space: {
    none: baseFoundation.spacing.none,
    xs: baseFoundation.spacing.xs,
    s: baseFoundation.spacing.s,
    m: baseFoundation.spacing.m,
    l: baseFoundation.spacing.l,
    xl: baseFoundation.spacing.xl,
    xxl: baseFoundation.spacing.xxl,
    true: baseFoundation.spacing.m,
  },
  size: {
    none: 0,
    caption3: baseFoundation.typography.size.caption3,
    caption2: baseFoundation.typography.size.caption2,
    caption1: baseFoundation.typography.size.caption1,
    body3: baseFoundation.typography.size.body3,
    body2: baseFoundation.typography.size.body2,
    body1: baseFoundation.typography.size.body1,
    subtitle2: baseFoundation.typography.size.subtitle2,
    subtitle1: baseFoundation.typography.size.subtitle1,
    h3: baseFoundation.typography.size.h3,
    h2: baseFoundation.typography.size.h2,
    h1: baseFoundation.typography.size.h1,
    h0: baseFoundation.typography.size.h0,
    xs: baseFoundation.typography.size.xs,
    s: baseFoundation.typography.size.s,
    m: baseFoundation.typography.size.m,
    l: baseFoundation.typography.size.l,
    xl: baseFoundation.typography.size.xl,
    xxl: baseFoundation.typography.size.xxl,
    title: baseFoundation.typography.size.title,
    buttonSm: 32,
    buttonMd: 44,
    buttonLg: 52,
    inputXs: 28,
    inputSm: 36,
    inputMd: 44,
    inputLg: 56,
    iconXs: baseFoundation.iconSize.xs,
    iconS: baseFoundation.iconSize.s,
    iconM: baseFoundation.iconSize.m,
    iconL: baseFoundation.iconSize.l,
    iconXl: baseFoundation.iconSize.xl,
    true: baseFoundation.typography.size.body1,
  },
  radius: {
    none: baseFoundation.radii.none,
    s: baseFoundation.radii.s,
    m: baseFoundation.radii.m,
    l: baseFoundation.radii.l,
    xl: baseFoundation.radii.xl,
    round: baseFoundation.radii.round,
    true: baseFoundation.radii.m,
  },
  zIndex: {
    base: baseFoundation.zIndex.base,
    dropdown: baseFoundation.zIndex.dropdown,
    sticky: baseFoundation.zIndex.sticky,
    fixed: baseFoundation.zIndex.fixed,
    modalBackdrop: baseFoundation.zIndex.modalBackdrop,
    modal: baseFoundation.zIndex.modal,
    popover: baseFoundation.zIndex.popover,
    tooltip: baseFoundation.zIndex.tooltip,
    toast: baseFoundation.zIndex.toast,
    true: baseFoundation.zIndex.base,
  },
});
