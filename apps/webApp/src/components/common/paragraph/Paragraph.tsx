import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn, paragraphVariants } from '@/design-system';

export interface ParagraphProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof paragraphVariants> {
  /**
   * HTML 요소 태그 (variant에서 자동 결정되지만 명시적 오버라이드 가능)
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
}

/**
 * 통합 Typography 컴포넌트
 *
 * @example
 * // Semantic variant 사용 (권장)
 * <Paragraph variant="title">제목</Paragraph>
 * <Paragraph variant="body">본문</Paragraph>
 * <Paragraph variant="caption">작은 텍스트</Paragraph>
 *
 * @example
 * // 세밀한 제어
 * <Paragraph size="lg" weight="bold" color="accent-quest">
 *   퀘스트 강조 텍스트
 * </Paragraph>
 *
 * @example
 * // 외부 className 오버라이드 (올바르게 작동)
 * <Paragraph className="text-blue-500 font-extrabold">
 *   커스텀 스타일
 * </Paragraph>
 */
const Paragraph = ({
  variant,
  size,
  weight,
  leading,
  color = 'primary',
  as,
  className,
  children,
  ...props
}: ParagraphProps) => {
  // variant에서 기본 태그 결정
  const getDefaultTag = (): React.ElementType => {
    if (as) return as;
    if (!variant) return 'p';

    const tagMap: Record<string, React.ElementType> = {
      title: 'h1',      // 페이지 제목
      subtitle: 'h2',   // 부제목
      body: 'p',        // 본문
      label: 'label',   // 폼 라벨
      caption: 'span',  // 작은 텍스트
    };

    return tagMap[variant] || 'p';
  };

  const Tag = getDefaultTag();

  return React.createElement(
    Tag,
    {
      className: cn(
        paragraphVariants({
          variant,
          size,
          weight,
          leading,
          color,
        }),
        className
      ),
      ...props,
    },
    children
  );
};

export default Paragraph;
