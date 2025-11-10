/**
 * Paragraph 컴포넌트 Variants (CVA)
 * 웹 전용 Tailwind CSS 기반 Typography variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const paragraphVariants = cva(
  'transition-colors duration-200', // base classes
  {
    variants: {
      // Size variants (Tailwind-based, extensible)
      size: {
        '4xs': 'text-[8px]',   // 0.5rem
        '3xs': 'text-[10px]',  // 0.625rem
        '2xs': 'text-[11px]',  // 0.6875rem
        xs: 'text-xs',         // 12px
        sm: 'text-sm',         // 14px
        base: 'text-base',     // 16px (기준)
        lg: 'text-lg',         // 18px
        xl: 'text-xl',         // 20px
        '2xl': 'text-2xl',     // 24px
        '3xl': 'text-3xl',     // 30px
        '4xl': 'text-4xl',     // 36px
      },

      // Weight variants
      weight: {
        light: 'font-light',       // 300
        normal: 'font-normal',     // 400
        medium: 'font-medium',     // 500
        semibold: 'font-semibold', // 600
        bold: 'font-bold',         // 700
      },

      // Line height variants
      leading: {
        tight: 'leading-tight',       // 1.25
        snug: 'leading-snug',         // 1.375
        normal: 'leading-normal',     // 1.5
        relaxed: 'leading-relaxed',   // 1.625
        loose: 'leading-loose',       // 2
      },

      // Color variants (semantic)
      color: {
        primary: 'text-primary-text-color dark:text-dark-primary-text-color',
        secondary: 'text-gray-main dark:text-dark-gray-main',
        muted: 'text-gray-400 dark:text-gray-500',
        error: 'text-quest-error-color',
        success: 'text-green-500 dark:text-green-600',
        warning: 'text-amber-500 dark:text-amber-600',
        info: 'text-blue-500 dark:text-blue-600',
        'accent-quest': 'text-quest-title-color',
        'accent-reward': 'text-primary-reward-text-color',
      },

      // Semantic variants (핵심 5가지)
      variant: {
        title: '',     // 페이지 제목
        subtitle: '',  // 부제목
        body: '',      // 본문 (기본)
        label: '',     // 폼/UI 라벨
        caption: '',   // 작은 설명
      },
    },
    compoundVariants: [
      // title: 3xl + bold + tight (페이지 제목)
      {
        variant: 'title',
        class: 'text-3xl font-bold leading-tight',
      },
      // subtitle: xl + semibold + snug (부제목)
      {
        variant: 'subtitle',
        class: 'text-xl font-semibold leading-snug',
      },
      // body: base + normal + normal (본문, 기본)
      {
        variant: 'body',
        class: 'text-base font-normal leading-normal',
      },
      // label: sm + medium + normal (폼/UI 라벨)
      {
        variant: 'label',
        class: 'text-sm font-medium leading-normal',
      },
      // caption: xs + normal + normal (작은 설명)
      {
        variant: 'caption',
        class: 'text-xs font-normal leading-normal',
      },
    ],
    defaultVariants: {
      size: 'base',
      weight: 'normal',
      leading: 'normal',
      color: 'primary',
      variant: undefined,
    },
  }
);

export type ParagraphVariantsProps = VariantProps<typeof paragraphVariants>;
