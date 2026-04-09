import React from 'react';
import type { TextProps } from 'react-native';

import { TamaguiText } from './tamagui';

/**
 * Typography variant types
 * - title: 페이지 제목 (30px, bold)
 * - subtitle: 부제목 (20px, semibold)
 * - body: 본문 (16px, regular)
 * - label: 폼/UI 라벨 (14px, medium)
 * - caption: 작은 설명 (12px, regular)
 */
export type TypographyVariant =
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption';

/**
 * Typography semantic color types
 * - primary: 기본 텍스트
 * - secondary: 보조 텍스트
 * - tertiary: 3차 텍스트 (더 연한)
 * - inverse: 반전 텍스트 (다크/라이트 배경용)
 * - link: 링크 텍스트
 * - error: 에러 메시지
 * - success: 성공 메시지
 * - warning: 경고 메시지
 * - info: 정보 메시지
 */
export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'link'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface TypographyProps extends TextProps {
  /**
   * Typography variant
   * @default 'body'
   */
  variant?: TypographyVariant;

  /**
   * Semantic color
   * @default 'primary'
   */
  color?: TypographyColor;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * Typography component with semantic variants and automatic theme switching.
 *
 * @example
 * // Basic usage
 * <Typography variant="title">페이지 제목</Typography>
 * <Typography variant="body">본문 텍스트</Typography>
 * <Typography variant="caption">작은 텍스트</Typography>
 *
 * @example
 * // Semantic colors
 * <Typography color="error">에러 메시지</Typography>
 * <Typography color="success">성공 메시지</Typography>
 * <Typography color="secondary">보조 텍스트</Typography>
 *
 * @example
 * // Custom style
 * <Typography variant="title" style={{ textAlign: 'center' }}>가운데 정렬</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const variantProps = typographyVariantStyles[variant];
  const colorToken = typographyColorMap[color];

  return (
    <TamaguiText
      color={colorToken}
      fontFamily="$body"
      style={style}
      {...variantProps}
      {...props}
    >
      {children}
    </TamaguiText>
  );
};

const typographyVariantStyles = {
  title: {
    fontSize: '$title',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '$xl',
    fontWeight: '600',
  },
  body: {
    fontSize: '$l',
    fontWeight: '400',
  },
  label: {
    fontSize: '$m',
    fontWeight: '500',
  },
  caption: {
    fontSize: '$s',
    fontWeight: '400',
  },
} as const;

const typographyColorMap = {
  primary: '$textPrimary',
  secondary: '$textSecondary',
  tertiary: '$textTertiary',
  inverse: '$textInverse',
  link: '$textLink',
  error: '$dangerLabel',
  success: '$success',
  warning: '$warning',
  info: '$info',
} as const;

export default Typography;
