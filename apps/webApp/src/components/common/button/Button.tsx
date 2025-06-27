import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'plain';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

const variantStyle: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-primary-color dark:bg-dark-primary-color-bold hover:bg-primary-color-hover dark:hover:bg-dark-primary-color-bold-hover',
  plain:
    'text-gray-main dark:text-dark-primary-text-color hover:text-gray-main-hover dark:hover:text-dark-primary-text-color-hover',
};

const sizeStyle: Record<ButtonSize, string> = {
  small: 'h-7 text-[12px] rounded-sm',
  medium: 'min-w-[60px] p-2 h-9 text-[14px] rounded-md',
  large: 'min-w-[100px] h-12 text-[16px] rounded-xl',
};

const Button = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={twMerge(
        `cursor-pointer transition-colors duration-200 ${variantStyle[variant]} ${sizeStyle[size]} ${className}`,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
