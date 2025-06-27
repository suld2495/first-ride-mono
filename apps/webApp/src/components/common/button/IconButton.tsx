import Button, { ButtonProps } from './Button';

export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gap?: number;
}

const IconButton = ({
  icon,
  iconPosition = 'left',
  children,
  className = '',
  gap = 2,
  ...props
}: IconButtonProps) => {
  return (
    <div className="">
      <Button
        className={`flex items-center justify-center ${className}`}
        style={{ gap: `${gap}px`, ...props.style }}
        {...props}
      >
        {iconPosition === 'left' && icon}
        {children}
        {iconPosition === 'right' && icon}
      </Button>
    </div>
  );
};

export default IconButton;
