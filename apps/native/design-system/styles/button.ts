/**
 * React Native Button 스타일 헬퍼
 * Semantic 토큰 기반 Button 스타일 생성
 */

import type { TextStyle, ViewStyle } from 'react-native';
import {
  actionColors,
  borderColors,
  borderRadius,
  type ColorScheme,
  contentColors,
  spacing,
} from '@repo/design-system';

/**
 * Button Size (웹 가이드 준수)
 * - sm: 32px
 * - md: 40px (기본)
 * - lg: 48px
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button Variant (웹 가이드 준수)
 * - primary: 주요 액션
 * - secondary: 보조 액션
 * - ghost: 투명 배경
 * - outline: 테두리만
 * - danger: 위험 액션
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger';

/**
 * Button Variant 스타일 (Semantic 토큰 활용)
 */
export const getButtonVariantStyle = (
  variant: ButtonVariant,
  scheme: ColorScheme,
): ViewStyle & { textColor: string } => {
  const variantStyles: Record<
    ButtonVariant,
    ViewStyle & { textColor: string }
  > = {
    // Primary: 브랜드 컬러 (action.primary)
    primary: {
      backgroundColor: actionColors.primary[scheme],
      textColor: contentColors.inverse[scheme],
    },

    // Secondary: 중립 gray (action.secondary)
    secondary: {
      backgroundColor: actionColors.secondary[scheme],
      textColor: contentColors.inverse[scheme],
    },

    // Ghost: 투명 배경
    ghost: {
      backgroundColor: 'transparent',
      textColor: contentColors.body[scheme],
    },

    // Outline: 테두리만
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: borderColors.default[scheme],
      textColor: contentColors.body[scheme],
    },

    // Danger: 위험 액션 (action.destructive)
    danger: {
      backgroundColor: actionColors.destructive[scheme],
      textColor: contentColors.inverse[scheme],
    },
  };

  return variantStyles[variant];
};

/**
 * Button Size 스타일 (웹 가이드 준수)
 */
export const getButtonSizeStyle = (
  size: ButtonSize,
): ViewStyle & { fontSize: number } => {
  const sizeStyles: Record<ButtonSize, ViewStyle & { fontSize: number }> = {
    sm: {
      height: 32,
      paddingHorizontal: spacing[3], // 12
      borderRadius: borderRadius.md, // 6
      fontSize: 14,
    },
    md: {
      height: 40,
      paddingHorizontal: spacing[4], // 16
      borderRadius: borderRadius.lg, // 8
      fontSize: 16,
    },
    lg: {
      height: 48,
      paddingHorizontal: spacing[6], // 24
      borderRadius: borderRadius.xl, // 12
      fontSize: 18,
    },
  };

  return sizeStyles[size];
};

/**
 * 완전한 Button 스타일 생성
 */
export const createButtonStyle = (
  variant: ButtonVariant,
  size: ButtonSize,
  scheme: ColorScheme,
): {
  container: ViewStyle;
  text: TextStyle;
  iconColor: string;
} => {
  const { textColor, ...containerVariantStyle } = getButtonVariantStyle(
    variant,
    scheme,
  );
  const { fontSize, ...containerSizeStyle } = getButtonSizeStyle(size);

  return {
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      ...containerVariantStyle,
      ...containerSizeStyle,
    },
    text: {
      color: textColor,
      fontSize,
      fontWeight: '500',
    },
    iconColor: textColor, // 아이콘은 텍스트와 같은 색상 사용
  };
};
