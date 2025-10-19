import React from "react";
import Label from "../input/Label";

export type FormItemProps<T extends Record<string, any>, K extends keyof T> = {
  name: K;
  label?: string;
  required?: boolean;
  children: (props: {
    value: T[K];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: () => void;
    name: K;
    form: T,
    setValue: <Key extends keyof T>(key: Key, value: T[Key]) => void;
  }) => React.ReactNode;
  className?: string;
  flex?: boolean;
  showErrors?: boolean;
  helpText?: string;
};

export type UseFormFieldReturn = {
  errors: string[];
  touched: boolean;
  isValid: boolean;
  set: (value: any, options?: { validate?: boolean; touch?: boolean }) => void;
  onBlur: () => void;
  bindInput: () => any;
  bindTextInput: () => any;
};

export function createFormItem<T extends Record<string, any>>(
  useFormField: <K extends keyof T>(name: K) => UseFormFieldReturn,
  useForm: () => any
) {
  return function FormItem<K extends keyof T>({
    name,
    label,
    children,
    className = "",
    showErrors = true,
    helpText,
    flex = false,
  }: FormItemProps<T, K>) {
    const field = useFormField(name);
    const formContext = useForm();
    const hasError = field.touched && !field.isValid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      field.set(e.target.value as any);
    };

    return (
      <div className={`flex ${flex ? 'flex-1' : ''} ${hasError ? 'form-item--error' : ''} ${className}`}>
        {label && (
          <Label htmlFor={String(name)} className="text-sm font-bold">
            {label}
          </Label>
        )}

        {children({
          value: field.bindInput().value,
          onChange: handleChange,
          onBlur: field.onBlur,
          name,
          form: formContext.form,
          setValue: formContext.setValue
        })}

        {helpText && !hasError && (
          <p className="">{helpText}</p>
        )}

        {showErrors && hasError && field.errors.length > 0 && (
          <div>
            {field.errors.map((error, index) => (
              <p key={index} className="text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  };
};
