import React from "react";
import { createFormComponent } from "@/components/common/form/Form";
import { createFormItem, UseFormFieldReturn } from "@/components/common/form/FormItem";
import { FormProviderProps, useCreateForm } from "@repo/shared/components";
import FormGroup from "@/components/common/form/FormGroup";

export type FormHooks<T extends Record<string, any>> = {
  Provider: React.ComponentType<FormProviderProps<T>>;
  useForm: () => any;
  useFormField: <K extends keyof T>(name: K) => UseFormFieldReturn;
};

export function createFormComponents<T extends Record<string, any>>(
  hooks: FormHooks<T>
) {
  const { Provider, useFormField, useForm } = hooks;

  const Form = createFormComponent<T>(Provider, useForm);
  const FormItem = createFormItem<T>(useFormField, useForm);

  return {
    Form,
    FormItem,
    FormGroup,
  };
};

export function createForm<T extends Record<string, any>>() {
  const hooks = useCreateForm<T>();
  const components = createFormComponents(hooks);
  
  return {
    ...hooks,
    ...components,
  };
}