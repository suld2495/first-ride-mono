import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

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
  optionalLabel?: string;
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
  tooltipText?: string;
  tooltipIcon?: React.ReactNode;
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
    tooltipText,
    tooltipIcon,
    flex = false,
    required = false,
    optionalLabel,
  }: FormItemProps<T, K>) {
    const field = useFormField(name);
    const formContext = useForm();
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const hasError = field.touched && !field.isValid;

    const handleChange = (text: string) => {
      field.set(text as T[K]);
    };

    return (
      <View style={[styles.container, { flex: flex ? 1 : 0 }]}>
        {label && tooltipText && isTooltipVisible && (
          <Pressable
            accessibilityLabel={`${label} 안내 닫기`}
            accessibilityRole="button"
            style={styles.tooltipBackdrop}
            onPress={() => setIsTooltipVisible(false)}
          />
        )}
        {label && (
          <View style={styles.labelRow}>
            <Typography variant="caption1" style={styles.label}>
              {label}
            </Typography>
            {required && (
              <Typography variant="caption1" style={styles.required}>
                *
              </Typography>
            )}
            {!required && optionalLabel && (
              <Typography variant="caption1" style={styles.optional}>
                {optionalLabel}
              </Typography>
            )}
            {tooltipText && (
              <View style={styles.tooltipContainer}>
                <Pressable
                  accessibilityLabel={`${label} 안내 보기`}
                  accessibilityRole="button"
                  hitSlop={baseFoundation.spacing[2]}
                  style={styles.tooltipButton}
                  onPress={() => setIsTooltipVisible((visible) => !visible)}
                >
                  {tooltipIcon ?? (
                    <Ionicons
                      name="information-circle-outline"
                      size={baseFoundation.iconSize.m}
                      color={styles.tooltipIcon.color}
                    />
                  )}
                </Pressable>
                {isTooltipVisible && (
                  <View style={styles.tooltipBubble}>
                    <Typography
                      variant="caption2"
                      weight="regular"
                      style={styles.tooltipText}
                    >
                      {tooltipText}
                    </Typography>
                  </View>
                )}
              </View>
            )}
          </View>
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
                variant="caption1"
                weight="medium"
                style={styles.errorText}
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
    gap: baseFoundation.spacing[1],
  },

  required: {
    color: theme.colors.field.required,
  },

  optional: {
    color: theme.colors.field.optional,
  },

  errorText: {
    color: theme.colors.tag.critical[700],
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
    alignSelf: 'flex-start',
    zIndex: baseFoundation.zIndex.tooltip,
  },

  tooltipBackdrop: {
    position: 'absolute',
    top: -1000,
    right: -1000,
    bottom: -1000,
    left: -1000,
    zIndex: baseFoundation.zIndex.tooltip - 1,
  },

  label: {
    color: theme.colors.field.label,
  },

  tooltipContainer: {
    position: 'relative',
    justifyContent: 'center',
  },

  tooltipButton: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tooltipIcon: {
    color: theme.colors.field.optional,
  },

  tooltipBubble: {
    position: 'absolute',
    top: baseFoundation.dimension.x24 + baseFoundation.spacing[0.5],
    left: -baseFoundation.spacing[2],
    width: 220,
    paddingHorizontal: baseFoundation.spacing[2.5],
    paddingVertical: baseFoundation.spacing[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.feedback.info.border,
    borderRadius: theme.foundation.radii.xs,
    backgroundColor: theme.colors.feedback.info.bg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
    zIndex: baseFoundation.zIndex.tooltip,
  },

  tooltipText: {
    color: theme.colors.feedback.info.text,
  },
}));
