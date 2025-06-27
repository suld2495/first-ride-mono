interface FormGroupProps {
  className?: string;
  children: React.ReactNode;
  gap?: number;
}

const FormGroup = ({ className, children, gap }: FormGroupProps) => {
  return (
    <div className={`flex ${className}`} style={{ gap: `${gap}px` }}>
      {children}
    </div>
  );
};

export { FormGroup };
