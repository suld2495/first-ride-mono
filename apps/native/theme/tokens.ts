import { createTokens } from 'tamagui';

import type { ResponsiveValue } from '@/theme/responsive';
import type { ThemeContract } from '@/theme/themes';

import { designSystem } from './design-system';

export const { palette } = designSystem;

export const baseFoundation = {
  spacing: designSystem.spacing,
  radii: designSystem.radii,
  typography: designSystem.typography,
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
    x96: 96,
    x99: 99,
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

const WIDE_SCREEN_TYPOGRAPHY_START = 390;
const WIDE_SCREEN_TYPOGRAPHY_END = 430;
const WIDE_SCREEN_TYPOGRAPHY_MAX_SCALE = 1.08;

export const getTypographyScaleForWidth = (viewportWidth?: number) => {
  if (!viewportWidth || viewportWidth <= WIDE_SCREEN_TYPOGRAPHY_START) {
    return 1;
  }

  if (viewportWidth >= WIDE_SCREEN_TYPOGRAPHY_END) {
    return WIDE_SCREEN_TYPOGRAPHY_MAX_SCALE;
  }

  const progress =
    (viewportWidth - WIDE_SCREEN_TYPOGRAPHY_START) /
    (WIDE_SCREEN_TYPOGRAPHY_END - WIDE_SCREEN_TYPOGRAPHY_START);

  return 1 + progress * (WIDE_SCREEN_TYPOGRAPHY_MAX_SCALE - 1);
};

export const createFoundation = (
  theme: ThemeContract,
  viewportWidth?: number,
) => {
  const densityScale =
    theme.density === 'compact'
      ? 0.85
      : theme.density === 'spacious'
        ? 1.15
        : 1;

  const typographyScale =
    (theme.typography?.scale ?? 1) * getTypographyScaleForWidth(viewportWidth);

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
      regular: 'Pretendard-Regular',
      medium: 'Pretendard-Medium',
      bold: 'Pretendard-Bold',
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
  baseFoundation.spacing[4] * multiplier;

export const tokens = createTokens({
  color: {
    white: '#FFFFFF',
    black: '#000000',
    true: palette.stitch.light.text,
  },
  space: {
    0: baseFoundation.spacing[0],
    px: baseFoundation.spacing.px,
    0.5: baseFoundation.spacing[0.5],
    1: baseFoundation.spacing[1],
    1.5: baseFoundation.spacing[1.5],
    2: baseFoundation.spacing[2],
    2.5: baseFoundation.spacing[2.5],
    3: baseFoundation.spacing[3],
    3.5: baseFoundation.spacing[3.5],
    4: baseFoundation.spacing[4],
    5: baseFoundation.spacing[5],
    6: baseFoundation.spacing[6],
    7: baseFoundation.spacing[7],
    8: baseFoundation.spacing[8],
    9: baseFoundation.spacing[9],
    10: baseFoundation.spacing[10],
    11: baseFoundation.spacing[11],
    12: baseFoundation.spacing[12],
    14: baseFoundation.spacing[14],
    16: baseFoundation.spacing[16],
    20: baseFoundation.spacing[20],
    24: baseFoundation.spacing[24],
    28: baseFoundation.spacing[28],
    32: baseFoundation.spacing[32],
    36: baseFoundation.spacing[36],
    40: baseFoundation.spacing[40],
    44: baseFoundation.spacing[44],
    48: baseFoundation.spacing[48],
    52: baseFoundation.spacing[52],
    56: baseFoundation.spacing[56],
    60: baseFoundation.spacing[60],
    64: baseFoundation.spacing[64],
    72: baseFoundation.spacing[72],
    80: baseFoundation.spacing[80],
    96: baseFoundation.spacing[96],
    true: baseFoundation.spacing[4],
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
