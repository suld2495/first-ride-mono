/**
 * Raw Typography Tokens
 * Tailwind CSS 표준 타이포그래피 스케일
 */

export const typography = {
  // Font Size Scale
  fontSize: {
    xs: 12,      // 0.75rem
    sm: 14,      // 0.875rem
    base: 16,    // 1rem (기준)
    lg: 18,      // 1.125rem
    xl: 20,      // 1.25rem
    '2xl': 24,   // 1.5rem
    '3xl': 30,   // 1.875rem
    '4xl': 36,   // 2.25rem
    '5xl': 48,   // 3rem
    '6xl': 60,   // 3.75rem
  },

  // Font Weight
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Height
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
} as const;

export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type LetterSpacing = keyof typeof typography.letterSpacing;
