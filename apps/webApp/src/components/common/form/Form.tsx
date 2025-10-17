import { FormProviderProps } from "@repo/shared/components";
import React from "react";


export type FormProps<T extends Record<string, any>> = Omit<FormProviderProps<T>, 'children'> & {
  children: React.ReactNode;
  className?: string;
  onSubmitCapture?: (e: React.FormEvent) => void;
};

export function createFormComponent<T extends Record<string, any>>(
  Provider: React.ComponentType<FormProviderProps<T>>
) {
  return function Form({ 
    children, 
    className = "", 
    onSubmitCapture,
    ...providerProps 
  }: FormProps<T>) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmitCapture?.(e);
    };

    return (
      <Provider {...providerProps}>
        <form 
          className={className} 
          onSubmit={handleSubmit}
          noValidate
        >
          {children}
        </form>
      </Provider>
    );
  };
}