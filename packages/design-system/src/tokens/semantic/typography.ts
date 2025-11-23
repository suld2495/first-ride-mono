/**
 * Semantic Typography Tokens
 * 의미 기반 타이포그래피 Variant (Raw 타이포그래피를 의미에 맞게 조합)
 *
 * Variants:
 * - display: 최대 크기 제목 (60px)
 * - hero: 큰 제목 (48px)
 * - title: 페이지 제목 (36px)
 * - subtitle: 부제목 (24px)
 * - body: 본문 (16px)
 * - caption: 작은 설명 (14px)
 * - label: 폼/UI 라벨 (12px)
 */

import { typography } from '../raw/typography';

export const typographyVariants = {
  // Display: 최대 크기 (랜딩 페이지, 마케팅)
  display: {
    fontSize: typography.fontSize['6xl'],      // 60
    fontWeight: typography.fontWeight.bold,    // '700'
    lineHeight: typography.lineHeight.tight,   // 1.25
  },

  // Hero: 큰 제목 (히어로 섹션)
  hero: {
    fontSize: typography.fontSize['5xl'],      // 48
    fontWeight: typography.fontWeight.bold,    // '700'
    lineHeight: typography.lineHeight.tight,   // 1.25
  },

  // Title: 페이지 제목
  title: {
    fontSize: typography.fontSize['4xl'],      // 36
    fontWeight: typography.fontWeight.bold,    // '700'
    lineHeight: typography.lineHeight.tight,   // 1.25
  },

  // Subtitle: 부제목/섹션 제목
  subtitle: {
    fontSize: typography.fontSize['2xl'],      // 24
    fontWeight: typography.fontWeight.semibold,// '600'
    lineHeight: typography.lineHeight.snug,    // 1.375
  },

  // Body: 본문 텍스트 (기본)
  body: {
    fontSize: typography.fontSize.base,        // 16
    fontWeight: typography.fontWeight.normal,  // '400'
    lineHeight: typography.lineHeight.normal,  // 1.5
  },

  // Caption: 작은 설명/부가 정보
  caption: {
    fontSize: typography.fontSize.sm,          // 14
    fontWeight: typography.fontWeight.normal,  // '400'
    lineHeight: typography.lineHeight.normal,  // 1.5
  },

  // Label: 폼/UI 라벨
  label: {
    fontSize: typography.fontSize.xs,          // 12
    fontWeight: typography.fontWeight.medium,  // '500'
    lineHeight: typography.lineHeight.normal,  // 1.5
  },
} as const;

export type TypographyVariant = keyof typeof typographyVariants;
