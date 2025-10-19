import { StyleSheet, View } from 'react-native';

import { COLORS } from '@/theme/colors';

import ThemeText from '../ThemeText';

export type FormItemProps<T extends Record<string, any>, K extends keyof T> = {
  name: K;
  label?: string;
  required?: boolean;
  children: (props: {
    value: T[K];
    onChange: (text: string) => void;
    onBlur?: () => void;
    name: K;
    form: T,
    setValue: <Key extends keyof T>(key: Key, value: T[Key]) => void;
  }) => React.ReactNode;
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
    showErrors = true,
    helpText,
    flex = false,
  }: FormItemProps<T, K>) {
    const field = useFormField(name);
    const formContext = useForm();
    const hasError = field.touched && !field.isValid;

    const handleChange = (text: string) => {
      field.set(text);
    };

    return (
      <View style={[styles.container, { flex: flex ? 1 : 0 }]}>
        {label && (
          <ThemeText style={styles.label} variant="medium">
            {label}
          </ThemeText>
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
          <ThemeText variant='caption'>{helpText}</ThemeText>
        )}

        {showErrors && hasError && field.errors.length > 0 && (
          <View>
            {field.errors.map((error) => (
              <ThemeText style={styles.error} variant="caption">
                {error}
              </ThemeText>
            ))}
          </View>
        )}
      </View>
    )
  };
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  label: {
    width: '100%',
  },

  error: {
    color: COLORS.light.error,
  },
});
