/**
 * React Native Typography 스타일 헬퍼
 * Semantic 토큰 기반 Typography 스타일 생성
 */

import type { TextStyle } from 'react-native';
import {
  type ColorScheme,
  contentColors,
  type FontSize,
  typography,
  type TypographyVariant,
  typographyVariants,
} from '@repo/design-system';

/**
 * Typography Variant 스타일 (Semantic 토큰 활용)
 */
export const getTypographyVariantStyle = (
  variant: TypographyVariant,
  scheme: ColorScheme,
): TextStyle => {
  const variantConfig = typographyVariants[variant];

  return {
    fontSize: variantConfig.fontSize,
    fontWeight: variantConfig.fontWeight,
    lineHeight: variantConfig.fontSize * variantConfig.lineHeight,
    color: contentColors.body[scheme],
  };
};

/**
 * Size override 옵션
 */
export interface TypographyOptions {
  size?: FontSize;
}

/**
 * 완전한 Typography 스타일 생성
 */
export const createTypographyStyle = (
  variant: TypographyVariant,
  scheme: ColorScheme,
  options?: TypographyOptions,
): TextStyle => {
  const variantConfig = typographyVariants[variant];

  // Size override가 있으면 적용
  const fontSize = options?.size
    ? typography.fontSize[options.size]
    : variantConfig.fontSize;

  return {
    fontSize,
    fontWeight: variantConfig.fontWeight,
    lineHeight: fontSize * variantConfig.lineHeight,
    color: contentColors.body[scheme],
  };
};
