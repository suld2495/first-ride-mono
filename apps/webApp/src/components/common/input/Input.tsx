import { twMerge } from 'tailwind-merge';

type InputVariant = 'primary' | 'plain';
type InputSize = 'small' | 'medium' | 'large';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
}

const variantStyle: Record<InputVariant, string> = {
  primary:
    'border-[1px] border-gray-300 dark:border-gray-400 focus:border-gray-500 dark:focus:border-gray-200 focus:ring-0 rounded-md transition-colors duration-300',
  plain: '',
};

const sizeStyle: Record<InputSize, string> = {
  small: 'h-7 text-[12px]',
  medium: 'min-w-[60px] p-2 h-9 text-[14px]',
  large: 'min-w-[100px] h-12 text-[16px]',
};

const Input = ({
  className,
  variant = 'primary',
  size = 'medium',
  type,
  ...rest
}: InputProps) => {
  return (
    <input
      className={twMerge(
        `outline-0 placeholder-gray-500 dark:placeholder-gray-400 text-gray-main dark:text-gray-200 ${type === 'date' && 'scheme-light dark:scheme-dark'}  ${variantStyle[variant]} ${sizeStyle[size]}`,
        className,
      )}
      type={type}
      {...rest}
    />
  );
};

export default Input;
