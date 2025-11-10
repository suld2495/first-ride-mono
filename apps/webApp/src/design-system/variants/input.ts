/**
 * Input 컴포넌트 Variants (CVA)
 * 웹 전용 Tailwind CSS 기반 Input variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'box-border outline-0 transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400 text-gray-main dark:text-gray-200',
  {
    variants: {
      // Variant styles
      variant: {
        primary:
          'border-[1px] border-gray-300 dark:border-gray-400 focus:border-gray-500 dark:focus:border-gray-200 focus:ring-0 rounded-md',
        plain: 'border-none',
        outline:
          'border-2 border-primary-color dark:border-dark-primary-color focus:border-primary-color-hover dark:focus:border-dark-primary-color-hover rounded-md',
      },

      // Size styles
      size: {
        small: 'h-7 px-2 text-[12px]',
        medium: 'min-w-[60px] h-9 px-3 text-[14px]',
        large: 'min-w-[100px] h-12 px-4 text-[16px]',
      },

      // State variants
      error: {
        true: 'border-quest-error-color focus:border-quest-error-color dark:border-quest-error-color dark:focus:border-quest-error-color',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        error: true,
        class: 'border-quest-error-color focus:border-quest-error-color',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
      error: false,
    },
  }
);

export type InputVariantsProps = VariantProps<typeof inputVariants>;
