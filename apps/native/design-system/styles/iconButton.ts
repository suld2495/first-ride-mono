/**
 * React Native IconButton 스타일 헬퍼
 * Semantic 토큰 기반 IconButton 스타일 생성
 */

import type { ViewStyle } from 'react-native';
import {
  actionColors,
  borderColors,
  borderRadius,
  type ColorScheme,
  contentColors,
  spacing,
} from '@repo/design-system';

/**
 * IconButton Size (웹 가이드 준수)
 * - sm: 32x32
 * - md: 40x40 (기본)
 * - lg: 48x48
 */
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * IconButton Variant (웹 가이드 준수)
 * - primary: 주요 액션
 * - secondary: 보조 액션
 * - ghost: 투명 배경
 * - outline: 테두리만
 * - danger: 위험 액션
 */
export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger';

/**
 * IconButton Variant 스타일 (Semantic 토큰 활용)
 */
export const getIconButtonVariantStyle = (
  variant: IconButtonVariant,
  scheme: ColorScheme,
): ViewStyle & { iconColor: string } => {
  const variantStyles: Record<
    IconButtonVariant,
    ViewStyle & { iconColor: string }
  > = {
    // Primary: 브랜드 컬러 (action.primary)
    primary: {
      backgroundColor: actionColors.primary[scheme],
      iconColor: contentColors.inverse[scheme],
    },

    // Secondary: 중립 gray (action.secondary)
    secondary: {
      backgroundColor: actionColors.secondary[scheme],
      iconColor: contentColors.inverse[scheme],
    },

    // Ghost: 투명 배경
    ghost: {
      backgroundColor: 'transparent',
      iconColor: contentColors.body[scheme],
    },

    // Outline: 테두리만
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: borderColors.default[scheme],
      iconColor: contentColors.body[scheme],
    },

    // Danger: 위험 액션 (action.destructive)
    danger: {
      backgroundColor: actionColors.destructive[scheme],
      iconColor: contentColors.inverse[scheme],
    },
  };

  return variantStyles[variant];
};

/**
 * IconButton Size 스타일 (웹 가이드 준수)
 * 정사각형 형태로 아이콘에 최적화된 패딩 적용
 */
export const getIconButtonSizeStyle = (
  size: IconButtonSize,
): ViewStyle & { iconSize: number } => {
  const sizeStyles: Record<IconButtonSize, ViewStyle & { iconSize: number }> = {
    sm: {
      width: 24,
      height: 24,
      padding: spacing[0.5], // 8
      borderRadius: borderRadius.md, // 6
      iconSize: 16,
    },
    md: {
      width: 32,
      height: 32,
      padding: spacing[0], // 8
      borderRadius: borderRadius.lg, // 8
      iconSize: 24,
    },
    lg: {
      width: 48,
      height: 48,
      padding: spacing[3], // 12
      borderRadius: borderRadius.xl, // 12
      iconSize: 28,
    },
  };

  return sizeStyles[size];
};

/**
 * 완전한 IconButton 스타일 생성
 */
export const createIconButtonStyle = (
  variant: IconButtonVariant,
  size: IconButtonSize,
  scheme: ColorScheme,
): {
  container: ViewStyle;
  iconColor: string;
  iconSize: number;
} => {
  const { iconColor, ...containerVariantStyle } = getIconButtonVariantStyle(
    variant,
    scheme,
  );
  const { iconSize, ...containerSizeStyle } = getIconButtonSizeStyle(size);

  return {
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      ...containerVariantStyle,
      ...containerSizeStyle,
    },
    iconColor,
    iconSize,
  };
};
