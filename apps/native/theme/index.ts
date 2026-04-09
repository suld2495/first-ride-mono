import { createAnimations } from '@tamagui/animations-react-native';
import { createFont, createTamagui } from 'tamagui';

import { baseFoundation } from '@/styles/tokens/foundation.base';

import { themes } from './themes';
import { tokens } from './tokens';

const bodyFont = createFont({
  family: 'System',
  size: {
    xs: baseFoundation.typography.size.xs,
    s: baseFoundation.typography.size.s,
    m: baseFoundation.typography.size.m,
    l: baseFoundation.typography.size.l,
    xl: baseFoundation.typography.size.xl,
    xxl: baseFoundation.typography.size.xxl,
    title: baseFoundation.typography.size.title,
    true: baseFoundation.typography.size.l,
  },
  lineHeight: {
    xs: Math.round(
      baseFoundation.typography.size.xs *
        baseFoundation.typography.lineHeight.normal,
    ),
    s: Math.round(
      baseFoundation.typography.size.s *
        baseFoundation.typography.lineHeight.normal,
    ),
    m: Math.round(
      baseFoundation.typography.size.m *
        baseFoundation.typography.lineHeight.normal,
    ),
    l: Math.round(
      baseFoundation.typography.size.l *
        baseFoundation.typography.lineHeight.normal,
    ),
    xl: Math.round(
      baseFoundation.typography.size.xl *
        baseFoundation.typography.lineHeight.tight,
    ),
    xxl: Math.round(
      baseFoundation.typography.size.xxl *
        baseFoundation.typography.lineHeight.tight,
    ),
    title: Math.round(
      baseFoundation.typography.size.title *
        baseFoundation.typography.lineHeight.tight,
    ),
    true: Math.round(
      baseFoundation.typography.size.l *
        baseFoundation.typography.lineHeight.normal,
    ),
  },
  weight: {
    regular: baseFoundation.typography.weight.regular,
    medium: baseFoundation.typography.weight.medium,
    semibold: baseFoundation.typography.weight.semibold,
    bold: baseFoundation.typography.weight.bold,
    true: baseFoundation.typography.weight.regular,
  },
  face: {
    400: { normal: 'System' },
    500: { normal: 'System' },
    600: { normal: 'System' },
    700: { normal: 'System' },
  },
});

export const tamaguiConfig = createTamagui({
  animations: createAnimations({
    fast: {
      damping: 20,
      mass: 1,
      stiffness: 250,
    },
    medium: {
      damping: 18,
      mass: 1,
      stiffness: 180,
    },
    slow: {
      damping: 16,
      mass: 1,
      stiffness: 120,
    },
  }),
  fonts: {
    body: bodyFont,
    heading: bodyFont,
  },
  themes,
  media: {
    xs: { maxWidth: baseFoundation.breakpoints.sm - 1 },
    sm: { minWidth: baseFoundation.breakpoints.sm },
    md: { minWidth: baseFoundation.breakpoints.md },
    lg: { minWidth: baseFoundation.breakpoints.lg },
    xl: { minWidth: baseFoundation.breakpoints.xl },
    short: { maxHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
  settings: {
    styleCompat: 'react-native',
  },
  shorthands: {
    ai: 'alignItems',
    bg: 'backgroundColor',
    br: 'borderRadius',
    bw: 'borderWidth',
    f: 'flex',
    fd: 'flexDirection',
    gap: 'gap',
    h: 'height',
    jc: 'justifyContent',
    m: 'margin',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    mt: 'marginTop',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    p: 'padding',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    pt: 'paddingTop',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    w: 'width',
  } as const,
  tokens,
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
