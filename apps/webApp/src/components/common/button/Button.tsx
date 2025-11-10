import React from 'react';
import { cn, buttonVariants, type ButtonVariantsProps } from '@/design-system';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
  loading?: boolean;
}

/**
 * 통합 Button 컴포넌트
 *
 * @example
 * <Button variant="primary" size="medium">저장</Button>
 * <Button variant="plain" size="small">취소</Button>
 * <Button variant="danger" loading>삭제중...</Button>
 *
 * @example
 * // className 오버라이드 (올바르게 작동)
 * <Button className="bg-blue-500 hover:bg-blue-600">
 *   커스텀 버튼
 * </Button>
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  className,
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
