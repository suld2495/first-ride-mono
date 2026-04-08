import type {
  FormContextType,
  FormProviderProps,
} from '@repo/shared/components';
import { useCreateForm as useCreateFormProvider } from '@repo/shared/components';
import type React from 'react';

import { createFormComponent } from '@/components/ui/form/form';
import type { UseFormFieldReturn } from '@/components/ui/form/form-item';
import { createFormItem } from '@/components/ui/form/form-item';

export type FormHooks<T extends Record<string, unknown>> = {
  Provider: React.ComponentType<FormProviderProps<T>>;
  useForm: () => FormContextType<T>;
  useFormField: <K extends keyof T>(name: K) => UseFormFieldReturn<T[K]>;
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
