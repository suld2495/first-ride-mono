import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Modal,
  Pressable,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
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
  minimumDate?: Date;
  variant?: InputVariant;
  defaultDate?: Date | null;
  buttonSize?: ButtonSize;
  buttonStyle?: StyleProp<ViewStyle>;
  isDateSelectable?: (date: Date) => boolean;
  onConfirmDate: (date: Date) => void;
}

const SHEET_ANIMATION_DURATION = baseFoundation.motion.duration.normal;

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
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isContentVisible, setIsContentVisible] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<Date | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const variantStyle = {
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    underlined: styles.variantUnderlined,
    ghost: styles.variantGhost,
  }[variant];

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = React.useCallback(() => {
    if (!isModalVisible || !isContentVisible) {
      return;
    }

    clearCloseTimer();
    setIsContentVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setIsModalVisible(false);
      setDraftDate(null);
      closeTimerRef.current = null;
    }, SHEET_ANIMATION_DURATION);
  }, [clearCloseTimer, isContentVisible, isModalVisible]);

  const open = () => {
    clearCloseTimer();
    setDraftDate(value ?? defaultDate);
    setIsModalVisible(true);
    setIsContentVisible(true);
  };

  React.useEffect(() => clearCloseTimer, [clearCloseTimer]);

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
      <Modal
        visible={isModalVisible}
        animationType="none"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={close}
      >
        <View style={styles.modalRoot}>
          {isContentVisible && (
            <>
              <Animated.View
                testID="date-picker-backdrop"
                entering={FadeIn.duration(SHEET_ANIMATION_DURATION)}
                exiting={FadeOut.duration(SHEET_ANIMATION_DURATION)}
                style={styles.sheetBackdrop}
              >
                <Pressable
                  accessibilityLabel={`${sheetLabel} 닫기`}
                  style={styles.backdropPressable}
                  onPress={close}
                />
              </Animated.View>
              <Animated.View
                testID="date-picker-sheet"
                entering={SlideInDown.duration(SHEET_ANIMATION_DURATION)}
                exiting={SlideOutDown.duration(SHEET_ANIMATION_DURATION)}
                style={styles.sheetContainer}
              >
                <Pressable
                  accessibilityLabel={`${sheetLabel} 바텀 시트`}
                  accessibilityViewIsModal
                  onPress={(event) => event?.stopPropagation?.()}
                >
                  <ThemeView
                    style={[
                      styles.sheetContent,
                      {
                        paddingBottom:
                          insets.bottom + baseFoundation.spacing[4],
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
              </Animated.View>
            </>
          )}
        </View>
      </Modal>
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

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },

  backdropPressable: {
    flex: 1,
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
