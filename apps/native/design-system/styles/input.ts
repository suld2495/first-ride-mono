/**
 * React Native Input 스타일 헬퍼
 * Semantic 토큰 기반 Input 스타일 생성
 */

import type { TextStyle, ViewStyle } from 'react-native';
import {
  borderColors,
  borderRadius,
  type ColorScheme,
  contentColors,
  feedbackColors,
  spacing,
  surfaceColors,
} from '@repo/design-system';

/**
 * Input Size (웹 가이드 준수)
 * - xs: 28px - 인라인, 필터
 * - sm: 32px - 컴팩트 폼
 * - md: 40px - 기본
 * - lg: 48px - 랜딩 페이지, CTA
 */
export type InputSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Input Variant (웹 가이드 준수)
 * - outlined: 전체 테두리 (기본)
 * - filled: 배경색, 테두리 없음
 * - underlined: 아래 테두리만
 * - ghost: 투명, 미니멀
 */
export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'ghost';

/**
 * Input State
 */
export interface InputStateOptions {
  error?: boolean;
  success?: boolean;
}

/**
 * Input Variant 스타일 (Semantic 토큰 활용)
 */
export const getInputVariantStyle = (
  variant: InputVariant,
  scheme: ColorScheme,
  state?: InputStateOptions,
): ViewStyle => {
  // State에 따른 border 색상
  let borderColor: string = borderColors.default[scheme];

  if (state?.error) borderColor = borderColors.error[scheme];
  if (state?.success) borderColor = borderColors.success[scheme];

  const variantStyles: Record<InputVariant, ViewStyle> = {
    // Outlined: 전체 테두리
    outlined: {
      borderWidth: 1,
      borderColor,
      backgroundColor: surfaceColors.base[scheme],
      borderRadius: borderRadius.lg, // 8
    },

    // Filled: 배경색, 테두리 없음
    filled: {
      borderWidth: 0,
      backgroundColor: surfaceColors.sunken[scheme],
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
    },

    // Underlined: 아래 테두리만
    underlined: {
      borderWidth: 0,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      backgroundColor: 'transparent',
    },

    // Ghost: 투명, 미니멀
    ghost: {
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
  };

  return variantStyles[variant];
};

/**
 * Input Size 스타일 (웹 가이드 준수)
 */
export const getInputSizeStyle = (
  size: InputSize,
): ViewStyle & { fontSize: number } => {
  const sizeStyles: Record<InputSize, ViewStyle & { fontSize: number }> = {
    xs: {
      height: 28,
      paddingHorizontal: spacing[2], // 8
      fontSize: 12,
    },
    sm: {
      height: 32,
      paddingHorizontal: spacing[3], // 12
      fontSize: 14,
    },
    md: {
      height: 40,
      paddingHorizontal: spacing[4], // 16
      fontSize: 16,
    },
    lg: {
      height: 48,
      paddingHorizontal: spacing[5], // 20
      fontSize: 18,
    },
  };

  return sizeStyles[size];
};

/**
 * Label 스타일
 */
export const getLabelStyle = (scheme: ColorScheme): TextStyle => {
  return {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing[1], // 4
    color: contentColors.body[scheme],
  };
};

/**
 * Helper Text 스타일
 */
export const getHelperTextStyle = (
  scheme: ColorScheme,
  state?: InputStateOptions,
): TextStyle => {
  let color: string = contentColors.muted[scheme];

  if (state?.error) color = feedbackColors.error.text[scheme];
  if (state?.success) color = feedbackColors.success.text[scheme];

  return {
    fontSize: 12,
    marginTop: spacing[1], // 4
    color,
  };
};

/**
 * 완전한 Input 스타일 생성
 */
export const createInputStyle = (
  variant: InputVariant,
  size: InputSize,
  scheme: ColorScheme,
  state?: InputStateOptions,
): {
  container: ViewStyle;
  input: TextStyle;
  placeholderColor: string;
  label: TextStyle;
  helperText: TextStyle;
} => {
  const { fontSize, ...containerSizeStyle } = getInputSizeStyle(size);

  return {
    container: {
      ...getInputVariantStyle(variant, scheme, state),
      ...containerSizeStyle,
    },
    input: {
      flex: 1,
      fontSize,
      color: contentColors.body[scheme],
    },
    placeholderColor: contentColors.placeholder[scheme],
    label: getLabelStyle(scheme),
    helperText: getHelperTextStyle(scheme, state),
  };
};
