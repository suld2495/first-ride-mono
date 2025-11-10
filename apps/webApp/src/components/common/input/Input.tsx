import React from 'react';
import { cn, inputVariants, type InputVariantsProps } from '@/design-system';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariantsProps {}

/**
 * 통합 Input 컴포넌트
 *
 * @example
 * <Input variant="primary" size="medium" placeholder="입력하세요" />
 * <Input variant="outline" error />
 * <Input type="date" className="w-full" />
 *
 * @example
 * // className 오버라이드 (올바르게 작동)
 * <Input className="border-blue-500 focus:border-blue-700" />
 */
const Input = ({
  className,
  variant = 'primary',
  size = 'medium',
  error = false,
  type,
  disabled,
  ...rest
}: InputProps) => {
  return (
    <input
      className={cn(
        inputVariants({ variant, size, error }),
        type === 'date' && 'scheme-light dark:scheme-dark',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      type={type}
      disabled={disabled}
      {...rest}
    />
  );
};

export default Input;
