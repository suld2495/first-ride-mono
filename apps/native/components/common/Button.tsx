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

import {
  type ButtonSize,
  type ButtonVariant,
  createButtonStyle,
} from '@/design-system';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * Button size (웹 가이드 준수)
   * - sm: 32px
   * - md: 40px (기본)
   * - lg: 48px
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Button variant (웹 가이드 준수)
   * - primary: 주요 액션
   * - secondary: 보조 액션
   * - ghost: 투명 배경
   * - outline: 테두리만
   * - danger: 위험 액션
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * 왼쪽 아이콘 (ReactNode 또는 render function)
   * render function을 사용하면 iconColor를 전달받을 수 있습니다
   */
  leftIcon?:
    | React.ReactNode
    | ((props: { color: string }) => React.ReactNode);

  /**
   * 오른쪽 아이콘 (ReactNode 또는 render function)
   * render function을 사용하면 iconColor를 전달받을 수 있습니다
   */
  rightIcon?:
    | React.ReactNode
    | ((props: { color: string }) => React.ReactNode);

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
 * Button 컴포넌트 (웹 가이드 기준)
 *
 * @example
 * // 기본 사용
 * <Button size="md" variant="primary">저장</Button>
 * <Button size="sm" variant="secondary">취소</Button>
 * <Button size="lg" variant="danger">삭제</Button>
 *
 * // 아이콘 포함
 * <Button variant="primary" leftIcon={<Icon />}>저장</Button>
 * <Button variant="ghost" rightIcon={<ChevronIcon />}>더보기</Button>
 *
 * // 로딩 상태
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
  const colorScheme = useColorScheme();
  const buttonStyle = createButtonStyle(variant, size, colorScheme);

  // 아이콘 렌더링 헬퍼
  const renderIcon = (
    icon?:
      | React.ReactNode
      | ((props: { color: string }) => React.ReactNode),
  ) => {
    if (!icon) return null;

    if (typeof icon === 'function') {
      return icon({ color: buttonStyle.iconColor });
    }

    return icon;
  };

  // 텍스트 렌더링 (children 우선, 없으면 title)
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={buttonStyle.text.color} />;
    }

    const content = children || title;

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {renderIcon(leftIcon)}
        {typeof content === 'string' ? (
          <Text style={buttonStyle.text}>{content}</Text>
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
        buttonStyle.container,
        fullWidth && { width: '100%' },
        pressed && { opacity: 0.8 },
        (disabled || loading) && { opacity: 0.5 },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
};

export default Button;
