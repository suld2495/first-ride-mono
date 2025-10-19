import { FormProviderProps } from "@repo/shared/components";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export type FormProps<T extends Record<string, any>> = Omit<FormProviderProps<T>, 'children'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>
};

export function createFormComponent<T extends Record<string, any>>(
  Provider: React.ComponentType<FormProviderProps<T>>,
) {
  return function Form({ 
    children,
    style,
    ...providerProps 
  }: FormProps<T>) {
    return (
      <Provider {...providerProps}>
        <View style={style}>
          {children}
        </View>
      </Provider>
    );
  };
}