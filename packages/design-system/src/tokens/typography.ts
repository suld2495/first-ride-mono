/**
 * 통합 타이포그래피 토큰
 * 웹과 React Native 모두에서 사용 가능한 플랫폼 독립적 타이포그래피 정의
 */

export const typography = {
  // Font Size Scale (base = 16px 기준)
  fontSize: {
    // 작은 사이즈 (4xs가 가장 작음)
    '4xs': 8,    // 0.5rem
    '3xs': 10,   // 0.625rem
    '2xs': 11,   // 0.6875rem
    xs: 12,      // 0.75rem
    sm: 14,      // 0.875rem
    base: 16,    // 1rem (기준)
    lg: 18,      // 1.125rem
    xl: 20,      // 1.25rem
    // 큰 사이즈
    '2xl': 24,   // 1.5rem
    '3xl': 30,   // 1.875rem
    '4xl': 36,   // 2.25rem
  },

  // Font Weight
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
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

/**
 * Semantic Typography Variants
 * 의미론적 타이포그래피 프리셋 (핵심 5가지)
 */
export const typographyVariants = {
  // 페이지 제목
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  // 부제목
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  // 본문 (기본)
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  // 폼/UI 라벨
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  // 작은 설명
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
} as const;

export type TypographyVariant = keyof typeof typographyVariants;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
