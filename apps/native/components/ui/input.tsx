import React from 'react';
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

/**
 * Input size types
 * - xs: 28px - 인라인, 필터
 * - sm: 36px - 컴팩트 폼
 * - md: 44px - 기본
 * - lg: 56px - 랜딩 페이지, CTA (stitch h-14)
 */
export type InputSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Input variant types
 * - outlined: 전체 테두리 (기본)
 * - filled: 배경색, 테두리 없음
 * - underlined: 아래 테두리만
 * - ghost: 투명, 미니멀
 */
export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'ghost';

/**
 * Input state types for border color
 */
export type InputState = 'default' | 'error' | 'success';

export type InputColor =
  | 'input'
  | 'title'
  | 'subtitle'
  | 'caption'
  | 'disabled'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Input variant
   * @default 'outlined'
   */
  variant?: InputVariant;

  /**
   * 에러 상태 (빨간색 테두리)
   */
  error?: boolean;

  /**
   * 성공 상태 (초록색 테두리)
   */
  success?: boolean;

  /**
   * 전체 너비
   */
  fullWidth?: boolean;

  /**
   * 라벨 텍스트
   */
  label?: string;

  /**
   * 도움말 텍스트 (에러 메시지 등)
   */
  helperText?: string;

  /**
   * 커스텀 스타일 (컨테이너)
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 입력 텍스트 색상 토큰
   * @default 'input'
   */
  color?: InputColor;
}

/**
 * Input component with semantic variants and automatic theme switching.
 *
 * @example
 * // Basic usage
 * <Input size="md" variant="outlined" placeholder="이메일" />
 * <Input size="md" variant="filled" placeholder="비밀번호" />
 * <Input size="sm" variant="underlined" placeholder="검색" />
 *
 * @example
 * // State display
 * <Input size="md" variant="outlined" error helperText="필수 항목입니다" />
 * <Input size="lg" variant="filled" success />
 *
 * @example
 * // With label
 * <Input
 *   label="이메일"
 *   placeholder="이메일을 입력하세요"
 *   helperText="example@email.com 형식으로 입력"
 * />
 */
export const Input: React.FC<InputProps> = ({
  size = 'md',
  variant = 'outlined',
  error,
  success,
  fullWidth,
  label,
  helperText,
  style,
  color = 'input',
  ...props
}) => {
  const { theme } = useAppTheme();
  const inputColorMap = {
    input: theme.colors.text.input,
    title: theme.colors.text.title,
    subtitle: theme.colors.text.label,
    caption: theme.colors.text.tertiary,
    disabled: theme.colors.text.disabled,
    error: theme.colors.feedback.error.text,
    success: theme.colors.feedback.success.text,
    warning: theme.colors.feedback.warning.text,
    info: theme.colors.feedback.info.text,
  } satisfies Record<InputColor, string>;
  const inputColor = inputColorMap[color];

  // 상태 결정
  const state: InputState = error ? 'error' : success ? 'success' : 'default';
  const sizeContainerStyle = {
    xs: styles.containerXs,
    sm: styles.containerSm,
    md: styles.containerMd,
    lg: styles.containerLg,
  }[size];
  const sizeInputStyle = {
    xs: styles.inputXs,
    sm: styles.inputSm,
    md: styles.inputMd,
    lg: styles.inputLg,
  }[size];
  const variantStyle = {
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    underlined: styles.variantUnderlined,
    ghost: styles.variantGhost,
  }[variant];
  const stateStyle = {
    default: null,
    error: styles.stateError,
    success: styles.stateSuccess,
  }[state];
  const helperStyle = {
    default: styles.helperDefault,
    error: styles.helperError,
    success: styles.helperSuccess,
  }[state];

  return (
    <View style={fullWidth && internalStyles.fullWidth}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          sizeContainerStyle,
          variantStyle,
          stateStyle,
          style,
        ]}
      >
        <TextInput
          style={[styles.input, sizeInputStyle, { color: inputColor }]}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
        />
      </View>
      {helperText && (
        <Text style={[styles.helperText, helperStyle]}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {},
  containerXs: {
    height: baseFoundation.dimension.x28,
    paddingHorizontal: theme.foundation.spacing[1],
  },
  containerSm: {
    height: baseFoundation.dimension.x36,
    paddingHorizontal: theme.foundation.spacing[2],
  },
  containerMd: {
    height: baseFoundation.dimension.x44,
    paddingHorizontal: theme.foundation.spacing[3],
  },
  containerLg: {
    height: baseFoundation.dimension.x56,
    paddingHorizontal: theme.foundation.spacing[4],
  },
  variantOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.foundation.radii.xs,
  },
  variantFilled: {
    borderWidth: 0,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.foundation.radii.xs,
  },
  variantUnderlined: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: 'transparent',
  },
  variantGhost: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  stateError: {
    borderColor: theme.colors.feedback.error.border,
  },
  stateSuccess: {
    borderColor: theme.colors.feedback.success.border,
  },
  input: {
    flex: 1,
    color: theme.colors.text.input,
  },
  inputXs: {
    fontSize: theme.foundation.typography.size.s,
  },
  inputSm: {
    fontSize: theme.foundation.typography.size.body3,
  },
  inputMd: {
    fontSize: theme.foundation.typography.size.m,
  },
  inputLg: {
    fontSize: theme.foundation.typography.size.xl,
  },
  label: {
    fontSize: theme.foundation.typography.size.m,
    fontWeight: '600',
    marginBottom: baseFoundation.spacing[1.5],
    marginLeft: baseFoundation.spacing[1],
    color: theme.colors.text.secondary,
  },
  helperText: {
    fontSize: theme.foundation.typography.size.s,
    marginTop: theme.foundation.spacing[1],
  },
  helperDefault: {
    color: theme.colors.text.secondary,
  },
  helperError: {
    color: theme.colors.feedback.error.text,
  },
  helperSuccess: {
    color: theme.colors.feedback.success.text,
  },
}));

const internalStyles = {
  fullWidth: {
    width: '100%' as const,
  },
};

export default Input;
