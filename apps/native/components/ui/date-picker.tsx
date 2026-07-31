import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import DateCalendar from '@/components/calendar/date-calendar';
import BottomSheet from '@/components/ui/bottom-sheet/bottom-sheet';
import type { ButtonSize } from '@/components/ui/button';
import DatePickerButton from '@/components/ui/date-picker-button';
import type { InputVariant } from '@/components/ui/input';

interface DatePickerProps {
  value: Date | null;
  buttonTitle: string;
  sheetLabel: string;
  minimumDate?: Date;
  variant?: InputVariant;
  defaultDate?: Date | null;
  buttonSize?: ButtonSize;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTestID?: string;
  disabled?: boolean;
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
  buttonTestID,
  disabled = false,
  isDateSelectable,
  onConfirmDate,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<Date | null>(null);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = () => {
    if (disabled) {
      return;
    }

    setDraftDate(value ?? defaultDate);
    setIsOpen(true);
  };

  const handleClosed = React.useCallback(() => {
    setDraftDate(null);
  }, []);

  return (
    <>
      <DatePickerButton
        testID={buttonTestID}
        buttonTitle={buttonTitle}
        variant={variant}
        buttonSize={buttonSize}
        buttonStyle={buttonStyle}
        disabled={disabled}
        onPress={open}
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
