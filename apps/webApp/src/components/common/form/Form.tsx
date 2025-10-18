import { FormContextType, FormProviderProps } from "@repo/shared/components";
import React from "react";

interface FormComponentProps {
  children: React.ReactNode;
  className?: string;
  useForm: () => FormContextType<unknown>
}

const FormComponent = ({ className, children, useForm }: FormComponentProps) => {
  const formContext = useForm();
  return (
    <form 
      className={className} 
      onSubmit={() => formContext.handleSubmit()}
      noValidate
    >
      {children}
    </form>
  )
};

export type FormProps<T extends Record<string, any>> = Omit<FormProviderProps<T>, 'children'> & {
  children: React.ReactNode;
  className?: string;
  onSubmitCapture?: (e: React.FormEvent) => void;
};

export function createFormComponent<T extends Record<string, any>>(
  Provider: React.ComponentType<FormProviderProps<T>>,
  useForm: () => any
) {
  return function Form({ 
    children, 
    className = "",
    ...providerProps 
  }: FormProps<T>) {
    return (
      <Provider {...providerProps}>
        <FormComponent 
          className={className}
          useForm={useForm}
        >
          {children}
        </FormComponent>
      </Provider>
    );
  };
}