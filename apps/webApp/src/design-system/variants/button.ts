/**
 * Button 컴포넌트 Variants (CVA)
 * 웹 전용 Tailwind CSS 기반 Button variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      // Variant styles
      variant: {
        primary:
          'text-white bg-primary-color dark:bg-dark-primary-color-bold hover:bg-primary-color-hover dark:hover:bg-dark-primary-color-bold-hover',
        plain:
          'text-gray-main dark:text-dark-primary-text-color hover:text-gray-main-hover dark:hover:text-dark-primary-text-color-hover bg-transparent',
        outline:
          'border-2 border-primary-color dark:border-dark-primary-color text-primary-color dark:text-dark-primary-color hover:bg-primary-color hover:text-white dark:hover:bg-dark-primary-color',
        danger:
          'text-white bg-quest-error-color hover:opacity-90',
        success:
          'text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
      },

      // Size styles
      size: {
        'very-small': 'h-5 px-2 text-[11px] rounded-sm',
        small: 'h-7 px-3 text-[12px] rounded-sm',
        medium: 'min-w-[60px] h-9 px-4 text-[14px] rounded-md',
        large: 'min-w-[100px] h-12 px-6 text-[16px] rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
);

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
