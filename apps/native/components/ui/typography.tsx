import React from 'react';
import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

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
  styles.useVariants({ variant, color } as UnistylesVariants<typeof styles>);

  return (
    <Text style={[styles.base, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    variants: {
      variant: {
        title: {
          fontSize: theme.foundation.typography.size.title,
          fontWeight: theme.foundation.typography.weight.bold,
          lineHeight:
            theme.foundation.typography.size.title *
            theme.foundation.typography.lineHeight.tight,
        },
        subtitle: {
          fontSize: theme.foundation.typography.size.xl,
          fontWeight: theme.foundation.typography.weight.semibold,
          lineHeight:
            theme.foundation.typography.size.xl *
            theme.foundation.typography.lineHeight.tight,
        },
        body: {
          fontSize: theme.foundation.typography.size.l,
          fontWeight: theme.foundation.typography.weight.regular,
          lineHeight:
            theme.foundation.typography.size.l *
            theme.foundation.typography.lineHeight.normal,
        },
        label: {
          fontSize: theme.foundation.typography.size.m,
          fontWeight: theme.foundation.typography.weight.medium,
          lineHeight:
            theme.foundation.typography.size.m *
            theme.foundation.typography.lineHeight.normal,
        },
        caption: {
          fontSize: theme.foundation.typography.size.s,
          fontWeight: theme.foundation.typography.weight.regular,
          lineHeight:
            theme.foundation.typography.size.s *
            theme.foundation.typography.lineHeight.normal,
        },
      },
      color: {
        primary: {
          color: theme.colors.text.primary,
        },
        secondary: {
          color: theme.colors.text.secondary,
        },
        tertiary: {
          color: theme.colors.text.tertiary,
        },
        inverse: {
          color: theme.colors.text.inverse,
        },
        link: {
          color: theme.colors.text.link,
        },
        error: {
          color: theme.colors.feedback.error.text,
        },
        success: {
          color: theme.colors.feedback.success.text,
        },
        warning: {
          color: theme.colors.feedback.warning.text,
        },
        info: {
          color: theme.colors.feedback.info.text,
        },
      },
    },
  },
}));

export default Typography;
