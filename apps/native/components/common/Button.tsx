import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

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

/**
 * Button component with semantic variants and automatic theme switching.
 *
 * @example
 * // Basic usage
 * <Button size="md" variant="primary">저장</Button>
 * <Button size="sm" variant="secondary">취소</Button>
 * <Button size="lg" variant="danger">삭제</Button>
 *
 * @example
 * // With icons
 * <Button variant="primary" leftIcon={<Icon />}>저장</Button>
 * <Button variant="ghost" rightIcon={<ChevronIcon />}>더보기</Button>
 *
 * @example
 * // Loading state
 * <Button loading>처리중...</Button>
 */
export const Button: React.FC<ButtonProps> = ({
  size = 'md',
  variant = 'primary',
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

  styles.useVariants({
    size,
    variant,
  } as UnistylesVariants<typeof styles>);

  // 아이콘 색상 가져오기
  const getIconColor = (): string => {
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
          <Text style={styles.text}>{content}</Text>
        ) : (
          content
        )}
        {renderIcon(rightIcon)}
      </View>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        fullWidth && internalStyles.fullWidth,
        pressed && internalStyles.pressed,
        (disabled || loading) && internalStyles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
};

// Unistyles variants를 사용하는 스타일
const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    variants: {
      size: {
        sm: {
          height: 32,
          paddingHorizontal: theme.foundation.spacing.s,
          borderRadius: theme.foundation.radii.s,
        },
        md: {
          height: 40,
          paddingHorizontal: theme.foundation.spacing.m,
          borderRadius: theme.foundation.radii.m,
        },
        lg: {
          height: 48,
          paddingHorizontal: theme.foundation.spacing.l,
          borderRadius: theme.foundation.radii.l,
        },
      },
      variant: {
        primary: {
          backgroundColor: theme.colors.action.primary.default,
        },
        secondary: {
          backgroundColor: theme.colors.action.secondary.default,
        },
        ghost: {
          backgroundColor: theme.colors.action.ghost.default,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border.default,
        },
        danger: {
          backgroundColor: theme.colors.feedback.error.bg,
        },
      },
    },
  },
  text: {
    fontWeight: '500',
    variants: {
      size: {
        sm: {
          fontSize: theme.foundation.typography.size.m,
        },
        md: {
          fontSize: theme.foundation.typography.size.l,
        },
        lg: {
          fontSize: theme.foundation.typography.size.xl,
        },
      },
      variant: {
        primary: {
          color: theme.colors.action.primary.label,
        },
        secondary: {
          color: theme.colors.action.secondary.label,
        },
        ghost: {
          color: theme.colors.action.ghost.label,
        },
        outline: {
          color: theme.colors.text.primary,
        },
        danger: {
          color: theme.colors.feedback.error.text,
        },
      },
    },
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
  },
  disabled: {
    opacity: 0.5,
  },
};

export default Button;
