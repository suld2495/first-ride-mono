import React from 'react';
import type { TextProps } from 'react-native';

import { useAppTheme, TamaguiText } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

/**
 * Typography variant types
 * - caption3/body1/subtitle/title/h 계열 폰트 스케일을 제공한다
 */
export type TypographyVariant =
  | 'caption3'
  | 'caption2'
  | 'caption1'
  | 'body3'
  | 'body2'
  | 'body1'
  | 'subtitle2'
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

export type TypographyWeight = keyof typeof baseFoundation.typography.weight;

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
   * Font weight
   * @default 'regular'
   */
  weight?: TypographyWeight;

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
 * <Typography variant="title" weight="semibold">페이지 제목</Typography>
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
 * <Typography variant="title" weight="semibold" style={{ textAlign: 'center' }}>가운데 정렬</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  glow = false,
  style,
  children,
  ...props
}) => {
  const { theme } = useAppTheme();
  const variantProps = typographyVariantStyles[variant];
  const semanticColor = typographyColorMap[color as TypographySemanticColor];
  const customColorStyle = semanticColor ? undefined : { color };
  const fontWeight = typographyWeightMap[weight];
  const glowStyle = glow
    ? {
        textShadowColor: theme.colors.action.primary.default,
        textShadowOffset: {
          width: baseFoundation.dimension.x0,
          height: baseFoundation.dimension.x0,
        },
        textShadowRadius: 8,
      }
    : undefined;

  return (
    <TamaguiText
      color={semanticColor}
      fontFamily="$body"
      fontWeight={fontWeight}
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
  },
  caption2: {
    fontSize: '$caption2',
  },
  caption1: {
    fontSize: '$caption1',
  },
  body3: {
    fontSize: '$body3',
  },
  body2: {
    fontSize: '$body2',
  },
  body1: {
    fontSize: '$body1',
  },
  subtitle2: {
    fontSize: '$subtitle2',
  },
  subtitle1: {
    fontSize: '$subtitle1',
  },
  title: {
    fontSize: '$title',
  },
  h3: {
    fontSize: '$h3',
  },
  h2: {
    fontSize: '$h2',
  },
  h1: {
    fontSize: '$h1',
  },
  h0: {
    fontSize: '$h0',
  },
  subtitle: {
    fontSize: '$subtitle2',
  },
  body: {
    fontSize: '$body1',
  },
  label: {
    fontSize: '$body3',
  },
  caption: {
    fontSize: '$caption2',
  },
  value: {
    fontSize: baseFoundation.typography.size.xxl,
  },
} as const;

const typographyWeightMap = baseFoundation.typography.weight;

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
