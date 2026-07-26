import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import DateCalendar from '@/components/calendar/date-calendar';
import BottomSheet from '@/components/ui/bottom-sheet/bottom-sheet';
import { Button, type ButtonSize } from '@/components/ui/button';
import type { InputVariant } from '@/components/ui/input';
import {
  StyleSheet,
  type AppThemes,
  useAppTheme,
} from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface DatePickerProps {
  value: Date | null;
  buttonTitle: string;
  sheetLabel: string;
  minimumDate?: Date;
  variant?: InputVariant;
  defaultDate?: Date | null;
  buttonSize?: ButtonSize;
  buttonStyle?: StyleProp<ViewStyle>;
  isDateSelectable?: (date: Date) => boolean;
  onConfirmDate: (date: Date) => void;
}

const DatePicker = ({
  value,
  buttonTitle,
  sheetLabel,
  minimumDate,
  variant = 'outlined',
  defaultDate = null,
  buttonSize,
  buttonStyle,
  isDateSelectable,
  onConfirmDate,
}: DatePickerProps) => {
  const { theme } = useAppTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<Date | null>(null);
  const variantStyle = {
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    underlined: styles.variantUnderlined,
    ghost: styles.variantGhost,
  }[variant];

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = () => {
    setDraftDate(value ?? defaultDate);
    setIsOpen(true);
  };

  const handleClosed = React.useCallback(() => {
    setDraftDate(null);
  }, []);

  return (
    <>
      <Button
        title={buttonTitle}
        variant="secondary"
        size={buttonSize}
        textColor={theme.colors.field.text}
        onPress={open}
        leftIcon={({ color }) => (
          <Ionicons
            name="calendar-clear-outline"
            size={baseFoundation.iconSize.s}
            color={color}
          />
        )}
        style={[variantStyle, buttonStyle]}
        textStyle={{
          fontWeight: '400',
          fontSize: baseFoundation.typography.size.m,
        }}
      />
      <BottomSheet
        visible={isOpen}
        label={sheetLabel}
        onRequestClose={close}
        onClosed={handleClosed}
      >
        <DateCalendar
          isInBottomSheet
          minimumDate={minimumDate}
          selectedDate={draftDate}
          onSelectDate={setDraftDate}
          isDateSelectable={isDateSelectable}
          onCancel={close}
          onConfirm={() => {
            if (!draftDate) {
              return;
            }

            onConfirmDate(draftDate);
            close();
          }}
        />
      </BottomSheet>
    </>
  );
};

export default DatePicker;

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
