export type FormGroupProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  gap?: number;
};

const FormGroup = ({
  title,
  children,
  className = '',
  description,
  gap = 5,
}: FormGroupProps) => {
  return (
    <div className={`form-group ${className}`}>
      {title && (
        <div className="form-group__header">
          <h3 className={`form-group__title`}>{title}</h3>
          {description && (
            <p className="form-group__description">{description}</p>
          )}
        </div>
      )}
      <div className={`flex ${className}`} style={{ gap: `${gap}px` }}>
        {children}
      </div>
    </div>
  );
};

export default FormGroup;
