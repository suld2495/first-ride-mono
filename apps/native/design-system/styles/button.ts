/**
 * React Native Button 스타일 헬퍼
 * 통합 토큰을 StyleSheet로 변환
 */

import type { ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, type ColorScheme } from '@repo/design-system';

export type ButtonVariant = 'primary' | 'plain' | 'outline' | 'danger' | 'success';
export type ButtonSize = 'very-small' | 'small' | 'medium' | 'large';

/**
 * Button Variant 스타일
 */
export const getButtonVariantStyle = (
  variant: ButtonVariant,
  scheme: ColorScheme
): ViewStyle => {
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: scheme === 'light' ? colors.primary.light : colors.primary.darkBold,
    },
    plain: {
      backgroundColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: scheme === 'light' ? colors.primary.light : colors.primary.dark,
    },
    danger: {
      backgroundColor: scheme === 'light' ? colors.status.error.light : colors.status.error.dark,
    },
    success: {
      backgroundColor: scheme === 'light' ? colors.status.success.light : colors.status.success.dark,
    },
  };

  return variantStyles[variant];
};

/**
 * Button Size 스타일
 */
export const getButtonSizeStyle = (size: ButtonSize): ViewStyle => {
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    'very-small': {
      paddingVertical: spacing[1], // 4
      paddingHorizontal: spacing[2], // 8
      borderRadius: borderRadius.sm,
    },
    small: {
      paddingVertical: spacing[1.5], // 6
      paddingHorizontal: spacing[3], // 12
      borderRadius: borderRadius.sm,
    },
    medium: {
      paddingVertical: spacing[2.5], // 10
      paddingHorizontal: spacing[4], // 16
      borderRadius: borderRadius.md,
    },
    large: {
      paddingVertical: spacing[3.5], // 14
      paddingHorizontal: spacing[5], // 20
      borderRadius: borderRadius.xl,
    },
  };

  return sizeStyles[size];
};

/**
 * Button 텍스트 색상
 */
export const getButtonTextColor = (
  variant: ButtonVariant,
  scheme: ColorScheme
): TextStyle => {
  if (variant === 'primary' || variant === 'danger' || variant === 'success') {
    return { color: colors.white };
  }

  if (variant === 'outline') {
    return {
      color: scheme === 'light' ? colors.primary.light : colors.primary.dark,
    };
  }

  // plain
  return {
    color: scheme === 'light' ? colors.text.secondary.light : colors.text.secondary.dark,
  };
};

/**
 * 완전한 Button 스타일 생성
 */
export const createButtonStyle = (
  variant: ButtonVariant,
  size: ButtonSize,
  scheme: ColorScheme
): {
  container: ViewStyle;
  text: TextStyle;
} => {
  return {
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      ...getButtonVariantStyle(variant, scheme),
      ...getButtonSizeStyle(size),
    },
    text: getButtonTextColor(variant, scheme),
  };
};
