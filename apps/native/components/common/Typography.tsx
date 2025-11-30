import React from 'react';
import {
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';
import {
  contentColors,
  feedbackColors,
  type TypographyVariant,
} from '@repo/design-system';

import {
  createTypographyStyle,
  type TypographyOptions,
} from '@/design-system/styles/typography';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Semantic color types for Typography
 */
export type TypographyColor =
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySecondary'
  | 'bodyTertiary'
  | 'muted'
  | 'disabled'
  | 'placeholder'
  | 'link'
  | 'inverse'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface TypographyProps extends TextProps {
  /**
   * Typography variant (웹 가이드 준수)
   * - display: 최대 크기 제목 (60px)
   * - hero: 큰 제목 (48px)
   * - title: 페이지 제목 (36px)
   * - subtitle: 부제목 (24px)
   * - body: 본문 (16px)
   * - caption: 작은 설명 (14px)
   * - label: 폼/UI 라벨 (12px)
   * @default 'body'
   */
  variant?: TypographyVariant;

  /**
   * Size override (웹 가이드 준수)
   * variant의 기본 크기를 오버라이드
   */
  size?: TypographyOptions['size'];

  /**
   * Semantic color (optional)
   * Uses semantic tokens from design system
   * @example
   * <Typography color="error">에러 메시지</Typography>
   * <Typography color="success">성공 메시지</Typography>
   */
  color?: TypographyColor;

  /**
   * 커스텀 스타일
   */
  style?: StyleProp<TextStyle>;

  /**
   * 텍스트 내용
   */
  children?: React.ReactNode;
}

/**
 * Typography 컴포넌트 (웹 가이드 기준)
 *
 * @example
 * // 기본 사용
 * <Typography variant="title">페이지 제목</Typography>
 * <Typography variant="body">본문 텍스트</Typography>
 * <Typography variant="caption">작은 텍스트</Typography>
 *
 * // Size 오버라이드
 * <Typography variant="title" size="6xl">매우 큰 제목</Typography>
 * <Typography variant="body" size="lg">큰 본문</Typography>
 *
 * // Semantic color 사용
 * <Typography color="error">에러 메시지</Typography>
 * <Typography color="success">성공 메시지</Typography>
 * <Typography color="bodySecondary">보조 텍스트</Typography>
 *
 * // 스타일 커스텀
 * <Typography variant="title" style={{ textAlign: 'center' }}>가운데 정렬</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  size,
  color,
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const textStyle = createTypographyStyle(variant, colorScheme, { size });

  // Semantic color 매핑
  const getSemanticColor = (): string | undefined => {
    if (!color) return undefined;

    // Feedback colors (error, success, warning, info)
    const feedbackColorMap: Record<string, string> = {
      error: feedbackColors.error.text[colorScheme],
      success: feedbackColors.success.text[colorScheme],
      warning: feedbackColors.warning.text[colorScheme],
      info: feedbackColors.info.text[colorScheme],
    };

    if (feedbackColorMap[color]) {
      return feedbackColorMap[color];
    }

    // Content colors (나머지)
    const contentColorKeys = color as keyof typeof contentColors;

    if (contentColors[contentColorKeys]) {
      return contentColors[contentColorKeys][colorScheme];
    }

    return undefined;
  };

  const semanticColor = getSemanticColor();

  return (
    <Text
      style={[textStyle, semanticColor && { color: semanticColor }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default Typography;
