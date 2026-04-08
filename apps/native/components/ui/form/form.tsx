import type { FormProviderProps } from '@repo/shared/components';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

export type FormProps<T extends Record<string, unknown>> = Omit<
  FormProviderProps<T>,
  'children'
> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function createFormComponent<T extends Record<string, unknown>>(
  Provider: React.ComponentType<FormProviderProps<T>>,
) {
  return function Form({ children, style, ...providerProps }: FormProps<T>) {
    return (
      <Provider {...providerProps}>
        <View style={style}>{children}</View>
      </Provider>
    );
  };
}
