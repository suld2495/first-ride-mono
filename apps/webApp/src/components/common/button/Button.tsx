import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'plain';
type ButtonSize = 'very-small' | 'small' | 'medium' | 'large';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  background?: string;
  size?: ButtonSize;
  children?: React.ReactNode;
  loading?: boolean;
}

const variantStyle: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-primary-color dark:bg-dark-primary-color-bold hover:bg-primary-color-hover dark:hover:bg-dark-primary-color-bold-hover',
  plain:
    'text-gray-main dark:text-dark-primary-text-color hover:text-gray-main-hover dark:hover:text-dark-primary-text-color-hover',
};

const sizeStyle: Record<ButtonSize, string> = {
  'very-small': 'h-5 text-[11px] rounded-sm',
  small: 'h-7 px-1 text-[12px] rounded-sm',
  medium: 'min-w-[60px] p-2 h-9 text-[14px] rounded-md',
  large: 'min-w-[100px] h-12 text-[16px] rounded-xl',
};

const Button = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  style,
  color,
  background,
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  const newStyle = {
    ...style,
    color,
    background,
  };

  return (
    <button
      className={twMerge(
        `cursor-pointer transition-colors duration-200 ${variantStyle[variant]} ${sizeStyle[size]} ${className}`,
      )}
      style={newStyle}
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
