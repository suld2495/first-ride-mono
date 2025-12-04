import React from 'react';
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

/**
 * Input size types
 * - xs: 28px - 인라인, 필터
 * - sm: 32px - 컴팩트 폼
 * - md: 40px - 기본
 * - lg: 48px - 랜딩 페이지, CTA
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
  ...props
}) => {
  const { theme } = useUnistyles();

  // 상태 결정
  const state: InputState = error ? 'error' : success ? 'success' : 'default';

  styles.useVariants({
    size,
    variant,
    state,
  } as UnistylesVariants<typeof styles>);

  return (
    <View style={fullWidth && internalStyles.fullWidth}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, style]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
        />
      </View>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      size: {
        xs: {
          height: 28,
          paddingHorizontal: theme.foundation.spacing.xs,
        },
        sm: {
          height: 32,
          paddingHorizontal: theme.foundation.spacing.s,
        },
        md: {
          height: 40,
          paddingHorizontal: theme.foundation.spacing.m,
        },
        lg: {
          height: 48,
          paddingHorizontal: theme.foundation.spacing.l,
        },
      },
      variant: {
        outlined: {
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          backgroundColor: theme.colors.background.base,
          borderRadius: theme.foundation.radii.m,
        },
        filled: {
          borderWidth: 0,
          backgroundColor: theme.colors.background.sunken,
          borderTopLeftRadius: theme.foundation.radii.m,
          borderTopRightRadius: theme.foundation.radii.m,
        },
        underlined: {
          borderWidth: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
          backgroundColor: 'transparent',
        },
        ghost: {
          borderWidth: 0,
          backgroundColor: 'transparent',
        },
      },
      state: {
        default: {},
        error: {
          borderColor: theme.colors.feedback.error.border,
        },
        success: {
          borderColor: theme.colors.feedback.success.border,
        },
      },
    },
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    variants: {
      size: {
        xs: {
          fontSize: theme.foundation.typography.size.s,
        },
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
    },
  },
  label: {
    fontSize: theme.foundation.typography.size.m,
    fontWeight: theme.foundation.typography.weight.medium,
    marginBottom: theme.foundation.spacing.xs,
    color: theme.colors.text.primary,
  },
  helperText: {
    fontSize: theme.foundation.typography.size.s,
    marginTop: theme.foundation.spacing.xs,
    variants: {
      state: {
        default: {
          color: theme.colors.text.secondary,
        },
        error: {
          color: theme.colors.feedback.error.text,
        },
        success: {
          color: theme.colors.feedback.success.text,
        },
      },
    },
  },
}));

const internalStyles = {
  fullWidth: {
    width: '100%' as const,
  },
};

export default Input;
