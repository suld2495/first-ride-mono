import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  createIconButtonStyle,
  type IconButtonSize,
  type IconButtonVariant,
} from '@/design-system/styles/iconButton';
import { useColorScheme } from '@/hooks/useColorScheme';

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
export const IconButton: React.FC<IconButtonProps> = ({
  size = 'md',
  variant = 'ghost',
  icon,
  loading,
  disabled,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const iconButtonStyle = createIconButtonStyle(variant, size, colorScheme);

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator size="small" color={iconButtonStyle.iconColor} />
      );
    }

    if (typeof icon === 'function') {
      return icon({
        color: iconButtonStyle.iconColor,
        size: iconButtonStyle.iconSize,
      });
    }

    return icon;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        iconButtonStyle.container,
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
