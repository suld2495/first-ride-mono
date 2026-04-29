import { View } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

export type FormItemProps<
  T extends Record<string, unknown>,
  K extends keyof T,
> = {
  name: K;
  label?: string;
  required?: boolean;
  item: (props: {
    value: T[K];
    onChange: (text: string) => void;
    onBlur?: () => void;
    name: K;
    form: T;
    setValue: <Key extends keyof T>(key: Key, value: T[Key]) => void;
  }) => React.ReactNode;
  flex?: boolean;
  showErrors?: boolean;
  helpText?: string;
};

export type UseFormFieldReturn<V = unknown> = {
  errors: string[];
  touched: boolean;
  isValid: boolean;
  set: (value: V, options?: { validate?: boolean; touch?: boolean }) => void;
  onBlur: () => void;
  bindInput: () => { value: V };
  bindTextInput: () => { value: string; onChangeText: (text: string) => void };
};

export function createFormItem<T extends Record<string, unknown>>(
  useFormField: <K extends keyof T>(name: K) => UseFormFieldReturn<T[K]>,
  useForm: () => {
    form: T;
    setValue: <Key extends keyof T>(key: Key, value: T[Key]) => void;
  },
) {
  return function FormItem<K extends keyof T>({
    name,
    label,
    item,
    showErrors = true,
    helpText,
    flex = false,
    required = false,
  }: FormItemProps<T, K>) {
    const field = useFormField(name);
    const formContext = useForm();
    const hasError = field.touched && !field.isValid;

    const handleChange = (text: string) => {
      field.set(text as T[K]);
    };

    return (
      <View style={[styles.container, { flex: flex ? 1 : 0 }]}>
        {label && (
          <Typography variant="body2" style={styles.label}>
            {label}
            {required && <Typography style={styles.required}> *</Typography>}
          </Typography>
        )}

        {item({
          value: field.bindInput().value,
          onChange: handleChange,
          onBlur: field.onBlur,
          name,
          form: formContext.form,
          setValue: formContext.setValue,
        })}

        {helpText && !hasError && (
          <Typography variant="caption2" weight="regular">
            {helpText}
          </Typography>
        )}

        {showErrors && hasError && field.errors.length > 0 && (
          <View>
            {field.errors.map((error, index) => (
              <Typography
                key={`${name as string}-error-${index}`}
                color="error"
                variant="caption"
              >
                {error}
              </Typography>
            ))}
          </View>
        )}
      </View>
    );
  };
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: baseFoundation.dimension.x10,
  },

  required: {
    color: theme.colors.brand.icon,
  },

  label: {
    color: theme.colors.text.label,
    width: '100%',
  },
}));
