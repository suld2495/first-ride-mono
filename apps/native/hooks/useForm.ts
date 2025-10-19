import React from 'react';
import {
  FormProviderProps,
  useCreateForm as useCreateFormProvider,
} from '@repo/shared/components';

import { createFormComponent } from '@/components/common/form/Form';
import {
  createFormItem,
  UseFormFieldReturn,
} from '@/components/common/form/FormItem';

export type FormHooks<T extends Record<string, unknown>> = {
  Provider: React.ComponentType<FormProviderProps<T>>;
  useForm: () => unknown;
  useFormField: <K extends keyof T>(name: K) => UseFormFieldReturn;
};

export function createFormComponents<T extends Record<string, unknown>>(
  hooks: FormHooks<T>,
) {
  const { Provider, useFormField, useForm } = hooks;

  const Form = createFormComponent<T>(Provider);
  const FormItem = createFormItem<T>(useFormField, useForm);

  return {
    Form,
    FormItem,
  };
}

export function useCreateForm<T extends Record<string, unknown>>() {
  const hooks = useCreateFormProvider<T>();
  const components = createFormComponents(hooks);

  return {
    ...hooks,
    ...components,
  };
}
