import React from 'react';
import type { TextProps } from 'react-native';
import { useUnistyles } from '@/lib/unistyles';

import { TamaguiText } from './tamagui';

/**
 * Typography variant types
 * - caption3/body1/subtitle/title/h 계열 폰트 스케일을 제공한다
 */
export type TypographyVariant =
  | 'caption3'
  | 'caption3Semibold'
  | 'caption2'
  | 'caption2Semibold'
  | 'caption1'
  | 'caption1Semibold'
  | 'body3'
  | 'body3Semibold'
  | 'body2'
  | 'body2Semibold'
  | 'body1'
  | 'body1Semibold'
  | 'subtitle2'
  | 'subtitle2Semibold'
  | 'subtitle1'
  | 'title'
  | 'h3'
  | 'h2'
  | 'h1'
  | 'h0'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption'
  | 'value';

type TypographySemanticColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'link'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

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
export type TypographyColor = TypographySemanticColor | (string & {});

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
   * Glow effect for highlighted text
   * @default false
   */
  glow?: boolean;

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
 * <Typography variant="body1">본문 텍스트</Typography>
 * <Typography variant="caption2">작은 텍스트</Typography>
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
  glow = false,
  style,
  children,
  ...props
}) => {
  const { theme } = useUnistyles();
  const variantProps = typographyVariantStyles[variant];
  const semanticColor = typographyColorMap[color as TypographySemanticColor];
  const customColorStyle = semanticColor ? undefined : { color };
  const glowStyle = glow
    ? {
        textShadowColor: theme.colors.action.primary.default,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
      }
    : undefined;

  return (
    <TamaguiText
      color={semanticColor}
      fontFamily="$body"
      style={[customColorStyle, glowStyle, style]}
      {...variantProps}
      {...props}
    >
      {children}
    </TamaguiText>
  );
};

const typographyVariantStyles = {
  caption3: {
    fontSize: '$caption3',
    fontWeight: '400',
  },
  caption3Semibold: {
    fontSize: '$caption3',
    fontWeight: '600',
  },
  caption2: {
    fontSize: '$caption2',
    fontWeight: '400',
  },
  caption2Semibold: {
    fontSize: '$caption2',
    fontWeight: '600',
  },
  caption1: {
    fontSize: '$caption1',
    fontWeight: '400',
  },
  caption1Semibold: {
    fontSize: '$caption1',
    fontWeight: '600',
  },
  body3: {
    fontSize: '$body3',
    fontWeight: '400',
  },
  body3Semibold: {
    fontSize: '$body3',
    fontWeight: '600',
  },
  body2: {
    fontSize: '$body2',
    fontWeight: '400',
  },
  body2Semibold: {
    fontSize: '$body2',
    fontWeight: '600',
  },
  body1: {
    fontSize: '$body1',
    fontWeight: '400',
  },
  body1Semibold: {
    fontSize: '$body1',
    fontWeight: '600',
  },
  subtitle2: {
    fontSize: '$subtitle2',
    fontWeight: '400',
  },
  subtitle2Semibold: {
    fontSize: '$subtitle2',
    fontWeight: '600',
  },
  subtitle1: {
    fontSize: '$subtitle1',
    fontWeight: '600',
  },
  title: {
    fontSize: '$title',
    fontWeight: '600',
  },
  h3: {
    fontSize: '$h3',
    fontWeight: '600',
  },
  h2: {
    fontSize: '$h2',
    fontWeight: '600',
  },
  h1: {
    fontSize: '$h1',
    fontWeight: '600',
  },
  h0: {
    fontSize: '$h0',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '$subtitle2',
    fontWeight: '600',
  },
  body: {
    fontSize: '$body1',
    fontWeight: '400',
  },
  label: {
    fontSize: '$body3',
    fontWeight: '600',
  },
  caption: {
    fontSize: '$caption2',
    fontWeight: '400',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
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
