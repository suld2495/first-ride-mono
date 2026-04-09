import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

/**
 * Button size types
 * - sm: 32px
 * - md: 40px (기본)
 * - lg: 48px
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button variant types
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

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * 커스텀 배경색 (variant 색상 대신 사용)
   */
  backgroundColor?: string;

  /**
   * 커스텀 텍스트/아이콘 색상 (variant 색상 대신 사용)
   */
  textColor?: string;

  /**
   * 왼쪽 아이콘 (ReactNode 또는 render function)
   * render function을 사용하면 iconColor를 전달받을 수 있습니다
   */
  leftIcon?: React.ReactNode | ((props: { color: string }) => React.ReactNode);

  /**
   * 오른쪽 아이콘 (ReactNode 또는 render function)
   * render function을 사용하면 iconColor를 전달받을 수 있습니다
   */
  rightIcon?: React.ReactNode | ((props: { color: string }) => React.ReactNode);

  /**
   * 로딩 상태
   */
  loading?: boolean;

  /**
   * 전체 너비
   */
  fullWidth?: boolean;

  /**
   * 커스텀 스타일 (정적 또는 동적 함수 지원)
   */
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);

  /**
   * 버튼 내용 (children 우선, 없으면 title 사용)
   */
  children?: React.ReactNode;

  /**
   * 버튼 텍스트 (deprecated - children 사용 권장)
   * @deprecated Use children instead
   */
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  size = 'md',
  variant = 'primary',
  backgroundColor,
  textColor,
  leftIcon,
  rightIcon,
  loading,
  fullWidth,
  disabled,
  style,
  children,
  title,
  ...props
}) => {
  const { theme } = useUnistyles();
  const sizeStyle = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];
  const variantStyle = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    ghost: styles.variantGhost,
    outline: styles.variantOutline,
    danger: styles.variantDanger,
  }[variant];
  const textSizeStyle = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  }[size];
  const textVariantStyle = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    ghost: styles.textGhost,
    outline: styles.textOutline,
    danger: styles.textDanger,
  }[variant];

  // 아이콘/텍스트 색상 가져오기 (textColor가 있으면 우선 사용)
  const getIconColor = (): string => {
    if (textColor) return textColor;

    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.action[variant].label;
      case 'danger':
        return theme.colors.feedback.error.text;
      case 'ghost':
      case 'outline':
        return theme.colors.action.ghost.label;
      default:
        return theme.colors.action.primary.label;
    }
  };

  const iconColor = getIconColor();

  // 아이콘 렌더링 헬퍼
  const renderIcon = (
    icon?: React.ReactNode | ((props: { color: string }) => React.ReactNode),
  ) => {
    if (!icon) return null;

    if (typeof icon === 'function') {
      return icon({ color: iconColor });
    }

    return icon;
  };

  // 텍스트 렌더링 (children 우선, 없으면 title)
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={iconColor} />;
    }

    const content = children || title;

    return (
      <View style={internalStyles.contentWrapper}>
        {renderIcon(leftIcon)}
        {typeof content === 'string' ? (
          <Text style={[styles.text, textSizeStyle, textVariantStyle]}>
            {content}
          </Text>
        ) : (
          content
        )}
        {renderIcon(rightIcon)}
      </View>
    );
  };

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onPress?.(e);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        sizeStyle,
        variantStyle,
        backgroundColor && { backgroundColor },
        fullWidth && internalStyles.fullWidth,
        pressed && internalStyles.pressed,
        (disabled || loading) && internalStyles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      {...props}
      onPress={handlePress}
    >
      {renderContent()}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: theme.colors.border.strong,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sizeSm: {
    height: 32,
    paddingHorizontal: theme.foundation.spacing.s,
    borderRadius: theme.foundation.radii.m,
  },
  sizeMd: {
    height: 44,
    paddingHorizontal: theme.foundation.spacing.m,
    borderRadius: theme.foundation.radii.m,
  },
  sizeLg: {
    height: 52,
    paddingHorizontal: theme.foundation.spacing.l,
    borderRadius: theme.foundation.radii.l,
  },
  variantPrimary: {
    backgroundColor: theme.colors.action.primary.default,
    shadowColor: theme.colors.action.primary.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  variantSecondary: {
    backgroundColor: theme.colors.action.secondary.default,
  },
  variantGhost: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.action.primary.default,
    elevation: 0,
    shadowOpacity: 0,
  },
  variantDanger: {
    backgroundColor: theme.colors.feedback.error.bg,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: theme.foundation.typography.size.m,
  },
  textMd: {
    fontSize: theme.foundation.typography.size.l,
  },
  textLg: {
    fontSize: theme.foundation.typography.size.xl,
  },
  textPrimary: {
    color: theme.colors.action.primary.label,
  },
  textSecondary: {
    color: theme.colors.action.secondary.label,
  },
  textGhost: {
    color: theme.colors.action.ghost.label,
  },
  textOutline: {
    color: theme.colors.text.primary,
  },
  textDanger: {
    color: theme.colors.feedback.error.text,
  },
}));

// 내부에서만 사용하는 정적 스타일
const internalStyles = {
  contentWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  fullWidth: {
    width: '100%' as const,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
};

export default Button;
