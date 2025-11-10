/**
 * React Native Text 스타일 헬퍼
 * 통합 토큰을 StyleSheet로 변환
 */

import type { TextStyle } from 'react-native';
import {
  typography,
  typographyVariants,
  type TypographyVariant,
  type FontSize,
  type FontWeight,
  type LineHeight,
  colors,
  type ColorScheme,
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
  leading: LineHeight
): TextStyle => ({
  lineHeight: typography.fontSize[size] * typography.lineHeight[leading],
});

/**
 * 텍스트 색상을 StyleSheet로 변환
 */
export const getTextColor = (
  colorKey: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning' | 'info' | 'accent-quest' | 'accent-reward',
  scheme: ColorScheme
): TextStyle => {
  const colorMap: Record<string, string> = {
    primary: scheme === 'light' ? colors.text.primary.light : colors.text.primary.dark,
    secondary: scheme === 'light' ? colors.text.secondary.light : colors.text.secondary.dark,
    muted: scheme === 'light' ? colors.text.muted.light : colors.text.muted.dark,
    error: scheme === 'light' ? colors.status.error.light : colors.status.error.dark,
    success: scheme === 'light' ? colors.status.success.light : colors.status.success.dark,
    warning: scheme === 'light' ? colors.status.warning.light : colors.status.warning.dark,
    info: scheme === 'light' ? colors.status.info.light : colors.status.info.dark,
    'accent-quest': colors.quest.primary,
    'accent-reward': colors.reward.primary,
  };

  return { color: colorMap[colorKey] || colors.black };
};

/**
 * Typography Variant를 StyleSheet로 변환
 */
export const getTypographyStyle = (
  variant: TypographyVariant,
  scheme: ColorScheme
): TextStyle => {
  const variantConfig = typographyVariants[variant];

  return {
    fontSize: variantConfig.fontSize,
    fontWeight: variantConfig.fontWeight,
    lineHeight: variantConfig.fontSize * variantConfig.lineHeight,
    color: scheme === 'light' ? colors.text.primary.light : colors.text.primary.dark,
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
    color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning' | 'info' | 'accent-quest' | 'accent-reward';
  }
): TextStyle => {
  const baseStyle = getTypographyStyle(variant, scheme);

  return {
    ...baseStyle,
    ...(options?.size && getFontSize(options.size)),
    ...(options?.weight && getFontWeight(options.weight)),
    ...(options?.leading && options?.size && getLineHeight(options.size, options.leading)),
    ...(options?.color && getTextColor(options.color, scheme)),
  };
};
