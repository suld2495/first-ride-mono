import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DateCalendar from '@/components/calendar/date-calendar';
import { Button, type ButtonSize } from '@/components/ui/button';
import type { InputVariant } from '@/components/ui/input';
import {
  StyleSheet,
  type AppThemes,
  useAppTheme,
} from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

interface DatePickerProps {
  value: Date | null;
  buttonTitle: string;
  sheetLabel: string;
  minimumDate: Date;
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
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<Date | null>(null);
  const variantStyle = {
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    underlined: styles.variantUnderlined,
    ghost: styles.variantGhost,
  }[variant];

  const close = () => {
    setIsOpen(false);
    setDraftDate(null);
  };

  const open = () => {
    setDraftDate(value ?? defaultDate);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        title={buttonTitle}
        variant="secondary"
        size={buttonSize}
        textColor={theme.colors.text.input}
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
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={close}
      >
        <Pressable
          accessibilityLabel={`${sheetLabel} 닫기`}
          style={styles.sheetOverlay}
          onPress={close}
        >
          <Pressable
            accessibilityLabel={`${sheetLabel} 바텀 시트`}
            accessibilityViewIsModal
            style={styles.sheetContainer}
            onPress={(event) => event?.stopPropagation?.()}
          >
            <ThemeView
              style={[
                styles.sheetContent,
                {
                  paddingBottom: insets.bottom + baseFoundation.spacing[4],
                },
              ]}
              variant="surface"
            >
              <ThemeView transparent style={styles.sheetHandle} />
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
            </ThemeView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default DatePicker;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  variantOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.foundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },

  variantFilled: {
    borderWidth: 0,
    backgroundColor: theme.colors.background.input,
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

  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },

  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: baseFoundation.radii.xl,
    borderTopRightRadius: baseFoundation.radii.xl,
    backgroundColor: theme.colors.brand.primary,
    overflow: 'hidden',
  },

  sheetContent: {
    gap: theme.foundation.spacing[2],
    maxHeight: '88%',
    paddingTop: theme.foundation.spacing[2],
    paddingHorizontal: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[4],
    backgroundColor: theme.colors.brand.primary,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: baseFoundation.dimension.x44,
    height: baseFoundation.dimension.x5,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.border.strong,
    opacity: 0.7,
  },
}));
