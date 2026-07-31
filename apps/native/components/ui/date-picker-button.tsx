import Ionicons from '@expo/vector-icons/Ionicons';
import type { StyleProp, ViewStyle } from 'react-native';

import { Button, type ButtonSize } from '@/components/ui/button';
import type { InputVariant } from '@/components/ui/input';
import {
  StyleSheet,
  type AppThemes,
  useAppTheme,
} from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface DatePickerButtonProps {
  buttonTitle: string;
  variant?: InputVariant;
  buttonSize?: ButtonSize;
  buttonStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
}

const DatePickerButton = ({
  buttonTitle,
  variant = 'outlined',
  buttonSize,
  buttonStyle,
  onPress,
}: DatePickerButtonProps) => {
  const { theme } = useAppTheme();
  const variantStyle = {
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    underlined: styles.variantUnderlined,
    ghost: styles.variantGhost,
  }[variant];

  return (
    <Button
      title={buttonTitle}
      variant="secondary"
      size={buttonSize}
      textColor={theme.colors.field.text}
      onPress={onPress}
      leftIcon={() => (
        <Ionicons
          name="calendar-clear-outline"
          size={baseFoundation.iconSize.s}
          color={theme.colors.action.primary.default}
        />
      )}
      style={[variantStyle, buttonStyle]}
      textStyle={{
        fontWeight: '400',
        fontSize: baseFoundation.typography.size.m,
      }}
    />
  );
};

export default DatePickerButton;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  variantOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.field.border,
    backgroundColor: theme.colors.field.background,
    borderRadius: theme.foundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },

  variantFilled: {
    borderWidth: 0,
    backgroundColor: theme.colors.field.background,
    borderRadius: theme.foundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },

  variantUnderlined: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },

  variantGhost: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
}));
