import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * IconButton size (웹 가이드 준수)
   * - sm: 32x32
   * - md: 40x40 (기본)
   * - lg: 48x48
   * @default 'md'
   */
  size?: IconButtonSize;

  /**
   * IconButton variant (웹 가이드 준수)
   * - primary: 주요 액션
   * - secondary: 보조 액션
   * - ghost: 투명 배경
   * - outline: 테두리만
   * - danger: 위험 액션
   * @default 'ghost'
   */
  variant?: IconButtonVariant;

  /**
   * 아이콘 (ReactNode 또는 render function)
   * render function을 사용하면 iconColor와 iconSize를 전달받을 수 있습니다
   */
  icon:
    | React.ReactNode
    | ((props: { color: string; size: number }) => React.ReactNode);

  /**
   * 로딩 상태
   */
  loading?: boolean;

  /**
   * 커스텀 스타일 (정적 또는 동적 함수 지원)
   */
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
}

/**
 * IconButton 컴포넌트 (웹 가이드 기준)
 * 텍스트 없이 아이콘만 사용하는 버튼으로, 정사각형 형태와 최적화된 패딩 제공
 *
 * @example
 * // 기본 사용
 * <IconButton
 *   icon={<Ionicons name="close" size={24} />}
 *   onPress={handleClose}
 * />
 *
 * // render function으로 iconColor와 iconSize 활용
 * <IconButton
 *   variant="primary"
 *   icon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
 *   onPress={handleAdd}
 * />
 *
 * // 다양한 variant와 size
 * <IconButton variant="primary" size="lg" icon={<Icon />} />
 * <IconButton variant="danger" size="sm" icon={<Icon />} />
 */
const SIZE_MAP: Record<IconButtonSize, { size: number; iconSize: number }> = {
  sm: { size: 32, iconSize: 16 },
  md: { size: 40, iconSize: 20 },
  lg: { size: 48, iconSize: 24 },
};

export const IconButton: React.FC<IconButtonProps> = ({
  size = 'md',
  variant = 'ghost',
  icon,
  loading,
  disabled,
  style,
  ...props
}) => {
  const { theme } = useUnistyles();

  styles.useVariants({ size, variant } as UnistylesVariants<typeof styles>);

  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.action.primary.label;
      case 'secondary':
        return theme.colors.action.secondary.label;
      case 'danger':
        return theme.colors.feedback.error.text;
      case 'outline':
      case 'ghost':
      default:
        return theme.colors.action.ghost.label;
    }
  };

  const iconColor = getIconColor();
  const iconSize = SIZE_MAP[size].iconSize;

  const renderIcon = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={iconColor} />;
    }

    if (typeof icon === 'function') {
      return icon({
        color: iconColor,
        size: iconSize,
      });
    }

    return icon;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
        (disabled || loading) && { opacity: 0.5 },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {renderIcon()}
    </Pressable>
  );
};

export default IconButton;

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.foundation.radii.m,
    variants: {
      size: {
        sm: {
          width: SIZE_MAP.sm.size,
          height: SIZE_MAP.sm.size,
        },
        md: {
          width: SIZE_MAP.md.size,
          height: SIZE_MAP.md.size,
        },
        lg: {
          width: SIZE_MAP.lg.size,
          height: SIZE_MAP.lg.size,
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
          backgroundColor: 'transparent',
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
}));
