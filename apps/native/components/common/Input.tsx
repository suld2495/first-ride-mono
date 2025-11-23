import React from 'react';
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import {
  createInputStyle,
  type InputSize,
  type InputVariant,
} from '@/design-system/styles/input';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input size (웹 가이드 준수)
   * - xs: 28px - 인라인, 필터
   * - sm: 32px - 컴팩트 폼
   * - md: 40px - 기본
   * - lg: 48px - 랜딩 페이지, CTA
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Input variant (웹 가이드 준수)
   * - outlined: 전체 테두리 (기본)
   * - filled: 배경색, 테두리 없음
   * - underlined: 아래 테두리만
   * - ghost: 투명, 미니멀
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
 * Input 컴포넌트 (웹 가이드 기준)
 *
 * @example
 * // 기본 사용
 * <Input size="md" variant="outlined" placeholder="이메일" />
 * <Input size="md" variant="filled" placeholder="비밀번호" />
 * <Input size="sm" variant="underlined" placeholder="검색" />
 *
 * // 상태 표시
 * <Input size="md" variant="outlined" error helperText="필수 항목입니다" />
 * <Input size="lg" variant="filled" success />
 *
 * // 라벨 포함
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
  const colorScheme = useColorScheme();
  const inputStyle = createInputStyle(variant, size, colorScheme, {
    error,
    success,
  });

  return (
    <View style={[fullWidth && { width: '100%' }]}>
      {label && <Text style={inputStyle.label}>{label}</Text>}
      <View style={[inputStyle.container, style]}>
        <TextInput
          style={inputStyle.input}
          placeholderTextColor={inputStyle.placeholderColor}
          {...props}
        />
      </View>
      {helperText && <Text style={inputStyle.helperText}>{helperText}</Text>}
    </View>
  );
};

export default Input;
