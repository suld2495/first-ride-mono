/**
 * React Native Text 스타일 헬퍼
 * 통합 토큰을 StyleSheet로 변환
 */

import type { TextStyle } from 'react-native';
import {
  type ColorScheme,
  contentColors,
  feedbackColors,
  type FontSize,
  type FontWeight,
  type LineHeight,
  rawColors,
  typography,
  type TypographyVariant,
  typographyVariants,
} from '@repo/design-system';

/**
 * Font Size를 StyleSheet로 변환
 */
export const getFontSize = (size: FontSize): TextStyle => ({
  fontSize: typography.fontSize[size],
});

/**
 * Font Weight를 StyleSheet로 변환
 */
export const getFontWeight = (weight: FontWeight): TextStyle => ({
  fontWeight: typography.fontWeight[weight],
});

/**
 * Line Height를 StyleSheet로 변환
 */
export const getLineHeight = (
  size: FontSize,
  leading: LineHeight,
): TextStyle => ({
  lineHeight: typography.fontSize[size] * typography.lineHeight[leading],
});

/**
 * 텍스트 색상을 StyleSheet로 변환
 */
export const getTextColor = (
  colorKey:
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'accent-quest'
    | 'accent-reward',
  scheme: ColorScheme,
): TextStyle => {
  const colorMap: Record<string, string> = {
    primary: contentColors.heading[scheme],
    secondary: contentColors.bodySecondary[scheme],
    muted: contentColors.muted[scheme],
    error: feedbackColors.error.text[scheme],
    success: feedbackColors.success.text[scheme],
    warning: feedbackColors.warning.text[scheme],
    info: feedbackColors.info.text[scheme],
    'accent-quest': rawColors.brand[600], // 퀘스트 강조 색상 (브랜드 컬러 활용)
    'accent-reward': rawColors.brand[600], // 보상 강조 색상 (브랜드 컬러 활용)
  };

  return { color: colorMap[colorKey] || rawColors.black };
};

/**
 * Typography Variant를 StyleSheet로 변환
 */
export const getTypographyStyle = (
  variant: TypographyVariant,
  scheme: ColorScheme,
): TextStyle => {
  const variantConfig = typographyVariants[variant];

  return {
    fontSize: variantConfig.fontSize,
    fontWeight: variantConfig.fontWeight,
    lineHeight: variantConfig.fontSize * variantConfig.lineHeight,
    color: contentColors.heading[scheme],
  };
};

/**
 * 완전한 Text 스타일 생성
 */
export const createTextStyle = (
  variant: TypographyVariant,
  scheme: ColorScheme,
  options?: {
    size?: FontSize;
    weight?: FontWeight;
    leading?: LineHeight;
    color?:
      | 'primary'
      | 'secondary'
      | 'muted'
      | 'error'
      | 'success'
      | 'warning'
      | 'info'
      | 'accent-quest'
      | 'accent-reward';
  },
): TextStyle => {
  const baseStyle = getTypographyStyle(variant, scheme);

  return {
    ...baseStyle,
    ...(options?.size && getFontSize(options.size)),
    ...(options?.weight && getFontWeight(options.weight)),
    ...(options?.leading &&
      options?.size &&
      getLineHeight(options.size, options.leading)),
    ...(options?.color && getTextColor(options.color, scheme)),
  };
};
