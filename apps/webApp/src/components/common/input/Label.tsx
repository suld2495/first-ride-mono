import { twMerge } from 'tailwind-merge';

type LabelSize = 'small' | 'medium' | 'large';

const sizeStyle: Record<LabelSize, string> = {
  small: 'text-[12px]',
  medium: 'min-w-[60px] text-[14px]',
  large: 'min-w-[100px] text-[16px]',
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  size?: LabelSize;
}

const Label = ({
  children,
  className,
  size = 'medium',
  ...props
}: LabelProps) => {
  return (
    <label
      className={twMerge(
        `font-semibold block dark:text-white ${sizeStyle[size]} ${className}`,
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
