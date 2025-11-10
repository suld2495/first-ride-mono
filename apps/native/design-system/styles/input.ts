/**
 * React Native Input 스타일 헬퍼
 * 통합 토큰을 StyleSheet로 변환
 */

import type { ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, borderWidth, type ColorScheme } from '@repo/design-system';

export type InputVariant = 'primary' | 'plain' | 'outline';
export type InputSize = 'small' | 'medium' | 'large';

/**
 * Input Variant 스타일
 */
export const getInputVariantStyle = (
  variant: InputVariant,
  scheme: ColorScheme,
  hasError?: boolean
): ViewStyle => {
  if (hasError) {
    return {
      borderWidth: borderWidth[1],
      borderColor: colors.status.error.light,
      borderRadius: borderRadius.md,
    };
  }

  const variantStyles: Record<InputVariant, ViewStyle> = {
    primary: {
      borderWidth: borderWidth[1],
      borderColor: scheme === 'light' ? colors.border.light : colors.border.dark,
      borderRadius: borderRadius.md,
    },
    plain: {
      borderWidth: 0,
    },
    outline: {
      borderWidth: borderWidth[2],
      borderColor: scheme === 'light' ? colors.primary.light : colors.primary.dark,
      borderRadius: borderRadius.md,
    },
  };

  return variantStyles[variant];
};

/**
 * Input Size 스타일
 */
export const getInputSizeStyle = (size: InputSize): ViewStyle => {
  const sizeStyles: Record<InputSize, ViewStyle> = {
    small: {
      height: 28, // h-7
      paddingHorizontal: spacing[2], // 8
    },
    medium: {
      height: 36, // h-9
      paddingHorizontal: spacing[3], // 12
    },
    large: {
      height: 48, // h-12
      paddingHorizontal: spacing[4], // 16
    },
  };

  return sizeStyles[size];
};

/**
 * Input 텍스트 스타일
 */
export const getInputTextStyle = (scheme: ColorScheme): TextStyle => {
  return {
    color: scheme === 'light' ? colors.text.secondary.light : colors.text.secondary.dark,
    fontSize: 14,
  };
};

/**
 * Input Placeholder 색상
 */
export const getInputPlaceholderColor = (scheme: ColorScheme): string => {
  return scheme === 'light' ? colors.text.muted.light : colors.text.muted.dark;
};

/**
 * 완전한 Input 스타일 생성
 */
export const createInputStyle = (
  variant: InputVariant,
  size: InputSize,
  scheme: ColorScheme,
  hasError?: boolean
): {
  container: ViewStyle;
  input: TextStyle;
  placeholderColor: string;
} => {
  return {
    container: {
      ...getInputVariantStyle(variant, scheme, hasError),
      ...getInputSizeStyle(size),
    },
    input: getInputTextStyle(scheme),
    placeholderColor: getInputPlaceholderColor(scheme),
  };
};
