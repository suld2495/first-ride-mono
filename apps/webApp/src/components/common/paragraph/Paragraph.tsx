import React from 'react';
import { twMerge } from 'tailwind-merge';

type ParagraphVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';

interface ParagraphProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ParagraphVariant;
}

const variantStyle: Record<ParagraphVariant, string> = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  p: 'text-sm font-normal',
  span: 'text-sm font-normal',
};

const Paragraph = ({
  variant = 'p',
  children,
  className = '',
  ...props
}: ParagraphProps) => {
  const Tag = variant;

  return React.createElement(
    Tag,
    {
      className: twMerge(
        `text-primary-text-color dark:text-dark-primary-text-color ${variantStyle[variant]} ${className}`,
      ),
      ...props,
    },
    children,
  );
};

export default Paragraph;
