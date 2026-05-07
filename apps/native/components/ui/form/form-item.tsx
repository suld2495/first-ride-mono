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
    flex = false,
    required = false,
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
            <Typography variant="body2" style={styles.label}>
              {label}
            </Typography>
            {required && <Typography style={styles.required}>*</Typography>}
            {tooltipText && (
              <View style={styles.tooltipContainer}>
                <Pressable
                  accessibilityLabel={`${label} 안내 보기`}
                  accessibilityRole="button"
                  hitSlop={baseFoundation.spacing[2]}
                  style={styles.tooltipButton}
                  onPress={() => setIsTooltipVisible((visible) => !visible)}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={baseFoundation.iconSize.m}
                    color={styles.tooltipIcon.color}
                  />
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
    gap: baseFoundation.spacing[2.5],
  },

  required: {
    color: theme.colors.brand.icon,
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
    color: theme.colors.text.label,
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
    color: theme.colors.feedback.info.text,
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
