import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';

import BottomSheetBody from '@/components/ui/bottom-sheet/bottom-sheet-body';
import BottomSheetFooter from '@/components/ui/bottom-sheet/bottom-sheet-footer';
import BottomSheetHeader from '@/components/ui/bottom-sheet/bottom-sheet-header';
import { Button } from '@/components/ui/button';
import {
  FlashList,
  type FlashListRef,
  type ListRenderItem,
} from '@/components/ui/flash-list';
import { StyleSheet, type AppThemes } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation, palette } from '@/theme/tokens';

interface DateCalendarProps {
  minimumDate?: Date;
  selectedDate: Date | null;
  selectedEndDate?: Date | null;
  onSelectDate: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isInBottomSheet?: boolean;
  isDateSelectable?: (date: Date) => boolean;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const PICKER_ITEM_HEIGHT = 44;

const formatMonthLabel = (date: Date) => {
  return `${date.getFullYear()}. ${date.getMonth() + 1}월`;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getStartOfDay = (date: Date) => {
  const normalized = new Date(date);

  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const getMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getMonthCells = (month: Date) => {
  const start = getMonthStart(month);
  const startWeekday = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
  ).getDate();
  const cellCount = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const firstCell = new Date(start);

  firstCell.setDate(start.getDate() - startWeekday);

  return Array.from({ length: cellCount }, (_, index) => {
    const cellDate = new Date(firstCell);

    cellDate.setDate(firstCell.getDate() + index);
    return cellDate;
  });
};

const getYearOptions = (baseDate: Date) => {
  const baseYear = baseDate.getFullYear();

  return Array.from({ length: 21 }, (_, index) => baseYear - 10 + index);
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index);

const clampIndex = (index: number, length: number) => {
  return Math.max(0, Math.min(index, length - 1));
};

const getWheelItemStyle = (distance: number) => {
  if (distance === 0) {
    return {
      opacity: 1,
    };
  }

  if (distance === 1) {
    return {
      opacity: 0.62,
    };
  }

  if (distance === 2) {
    return {
      opacity: 0.32,
    };
  }

  return {
    opacity: 0.12,
  };
};

const getPickerItemLayout = (_: number[] | null, index: number) => ({
  length: PICKER_ITEM_HEIGHT,
  offset: PICKER_ITEM_HEIGHT * index,
  index,
});

const DateCalendar = ({
  minimumDate,
  selectedDate,
  selectedEndDate = null,
  onSelectDate,
  onConfirm,
  onCancel,
  isInBottomSheet = false,
  isDateSelectable,
}: DateCalendarProps) => {
  const yearListRef = React.useRef<FlashListRef<number>>(null);
  const monthListRef = React.useRef<FlashListRef<number>>(null);
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    getMonthStart(selectedDate ?? minimumDate ?? new Date()),
  );
  const [isMonthPickerOpen, setIsMonthPickerOpen] = React.useState(false);
  const [draftYear, setDraftYear] = React.useState(currentMonth.getFullYear());
  const [draftMonth, setDraftMonth] = React.useState(currentMonth.getMonth());
  const minDate = minimumDate ? getStartOfDay(minimumDate) : null;
  const todayKey = formatDateKey(new Date());
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedEndKey = selectedEndDate
    ? formatDateKey(selectedEndDate)
    : null;
  const rangeStartTime = selectedDate?.getTime() ?? null;
  const rangeEndTime = selectedEndDate?.getTime() ?? null;
  const cells = getMonthCells(currentMonth);
  const yearOptions = getYearOptions(currentMonth);

  const openMonthPicker = () => {
    setDraftYear(currentMonth.getFullYear());
    setDraftMonth(currentMonth.getMonth());
    setIsMonthPickerOpen(true);
  };

  const handleYearScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = clampIndex(
      Math.round(event.nativeEvent.contentOffset.y / PICKER_ITEM_HEIGHT),
      yearOptions.length,
    );
    const nextYear = yearOptions[index];

    setDraftYear(nextYear);
  };

  const handleMonthScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = clampIndex(
      Math.round(event.nativeEvent.contentOffset.y / PICKER_ITEM_HEIGHT),
      MONTH_OPTIONS.length,
    );
    const nextMonth = MONTH_OPTIONS[index];

    setDraftMonth(nextMonth);
  };

  const yearInitialIndex = clampIndex(
    yearOptions.indexOf(draftYear),
    yearOptions.length,
  );
  const monthInitialIndex = clampIndex(draftMonth, MONTH_OPTIONS.length);

  const scrollYearToIndex = (index: number) => {
    yearListRef.current?.scrollToOffset({
      offset: index * PICKER_ITEM_HEIGHT,
      animated: true,
    });
  };

  const scrollMonthToIndex = (index: number) => {
    monthListRef.current?.scrollToOffset({
      offset: index * PICKER_ITEM_HEIGHT,
      animated: true,
    });
  };

  const renderYearItem = React.useCallback<ListRenderItem<number>>(
    ({ item, index }) => {
      const distance = Math.abs(index - yearInitialIndex);
      const wheelStyle = getWheelItemStyle(distance);

      return (
        <Pressable
          accessibilityLabel={`${item}년 선택`}
          onPress={() => {
            setDraftYear(item);
            scrollYearToIndex(index);
          }}
          style={[
            styles.wheelItem,
            {
              opacity: wheelStyle.opacity,
            },
          ]}
        >
          <Typography
            variant="body"
            color={item === draftYear ? 'primary' : 'secondary'}
            style={[
              styles.wheelItemText,
              item === draftYear && styles.wheelItemSelectedText,
            ]}
          >
            {item}년
          </Typography>
        </Pressable>
      );
    },
    [draftYear, yearInitialIndex],
  );

  const renderMonthItem = React.useCallback<ListRenderItem<number>>(
    ({ item, index }) => {
      const distance = Math.abs(index - monthInitialIndex);
      const wheelStyle = getWheelItemStyle(distance);

      return (
        <Pressable
          accessibilityLabel={`${item + 1}월 선택`}
          onPress={() => {
            setDraftMonth(item);
            scrollMonthToIndex(index);
          }}
          style={[
            styles.wheelItem,
            {
              opacity: wheelStyle.opacity,
            },
          ]}
        >
          <Typography
            variant="body"
            color={item === draftMonth ? 'primary' : 'secondary'}
            style={[
              styles.wheelItemText,
              item === draftMonth && styles.wheelItemSelectedText,
            ]}
          >
            {item + 1}월
          </Typography>
        </Pressable>
      );
    },
    [draftMonth, monthInitialIndex],
  );

  const header = (
    <ThemeView transparent style={styles.header}>
      <Button
        variant="ghost"
        size="sm"
        onPress={() =>
          setCurrentMonth(
            new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth() - 1,
              1,
            ),
          )
        }
        leftIcon={({ color }) => (
          <Ionicons
            name="chevron-back"
            size={baseFoundation.dimension.x18}
            color={color}
          />
        )}
        style={styles.monthButton}
      />
      <Pressable
        onPress={openMonthPicker}
        accessibilityLabel="년월 선택 열기"
        style={styles.monthTitleButton}
      >
        <Typography variant="body2" weight="semibold" style={styles.monthTitle}>
          {formatMonthLabel(currentMonth)}
        </Typography>
      </Pressable>
      <Button
        variant="ghost"
        size="sm"
        onPress={() =>
          setCurrentMonth(
            new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth() + 1,
              1,
            ),
          )
        }
        rightIcon={({ color }) => (
          <Ionicons
            name="chevron-forward"
            size={baseFoundation.dimension.x18}
            color={color}
          />
        )}
        style={styles.monthButton}
      />
    </ThemeView>
  );

  const body = isMonthPickerOpen ? (
    <ThemeView transparent style={styles.pickerColumns}>
      <View style={styles.pickerColumn}>
        <View style={styles.wheelFrame}>
          <View pointerEvents="none" style={styles.wheelHighlight} />
          <FlashList
            ref={yearListRef}
            data={yearOptions}
            keyExtractor={(item) => `${item}`}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
            snapToInterval={PICKER_ITEM_HEIGHT}
            decelerationRate="fast"
            getItemLayout={getPickerItemLayout}
            initialScrollIndex={yearInitialIndex}
            onMomentumScrollEnd={handleYearScrollEnd}
            contentContainerStyle={styles.wheelContent}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={renderYearItem}
          />
        </View>
      </View>

      <View style={styles.pickerColumn}>
        <View style={styles.wheelFrame}>
          <View pointerEvents="none" style={styles.wheelHighlight} />
          <FlashList
            ref={monthListRef}
            data={MONTH_OPTIONS}
            keyExtractor={(item) => `${item}`}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
            snapToInterval={PICKER_ITEM_HEIGHT}
            decelerationRate="fast"
            getItemLayout={getPickerItemLayout}
            initialScrollIndex={monthInitialIndex}
            onMomentumScrollEnd={handleMonthScrollEnd}
            contentContainerStyle={styles.wheelContent}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={renderMonthItem}
          />
        </View>
      </View>
    </ThemeView>
  ) : (
    <ThemeView transparent style={styles.dateArea}>
      <ThemeView transparent style={styles.weekHeader}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekHeaderCell}>
            <Typography
              variant="body3"
              weight="regular"
              color={palette.theme.gray[10]}
            >
              {label}
            </Typography>
          </View>
        ))}
      </ThemeView>

      <ThemeView transparent style={styles.grid}>
        {cells.map((date) => {
          const inCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const dateKey = formatDateKey(date);
          const isToday = todayKey === dateKey;
          const isSelectable =
            (!minDate || getStartOfDay(date).getTime() >= minDate.getTime()) &&
            (isDateSelectable ? isDateSelectable(date) : true);
          const dateTime = getStartOfDay(date).getTime();
          const isSelected =
            selectedKey === dateKey || selectedEndKey === dateKey;
          const isInRange =
            rangeStartTime !== null &&
            rangeEndTime !== null &&
            dateTime >= rangeStartTime &&
            dateTime <= rangeEndTime;
          const isRangeStart = dateTime === rangeStartTime;
          const isRangeEnd = dateTime === rangeEndTime;
          const dateTextColor = isSelected
            ? palette.white
            : !isSelectable || !inCurrentMonth
              ? palette.theme.gray[10]
              : palette.theme.gray[90];

          return (
            <Pressable
              key={dateKey}
              accessibilityLabel={`${dateKey} ${isSelectable ? '선택 가능' : '선택 불가'}`}
              disabled={!isSelectable}
              onPress={() => onSelectDate(getStartOfDay(date))}
              style={[
                styles.dayCell,
                !inCurrentMonth && !isSelectable && styles.dayCellOutsideMonth,
                !isSelectable && inCurrentMonth && styles.dayCellDisabled,
                isSelectable && styles.dayCellEnabled,
              ]}
            >
              {isInRange && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.dayCellRangeBackground,
                    isRangeStart && styles.dayCellRangeStart,
                    isRangeEnd && styles.dayCellRangeEnd,
                  ]}
                />
              )}
              <View
                style={[
                  styles.dayNumber,
                  isSelectable && styles.dayNumberEnabled,
                  isToday && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                <Typography
                  variant="body3"
                  weight="regular"
                  color={dateTextColor}
                >
                  {date.getDate()}
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </ThemeView>
    </ThemeView>
  );

  const footer = isMonthPickerOpen ? (
    <>
      <Button
        title="취소"
        variant="ghost"
        size="sm"
        onPress={() => setIsMonthPickerOpen(false)}
      />
      <Button
        title="적용"
        variant="primary"
        size="sm"
        onPress={() => {
          setCurrentMonth(new Date(draftYear, draftMonth, 1));
          setIsMonthPickerOpen(false);
        }}
      />
    </>
  ) : !isInBottomSheet ? (
    <Button
      title="선택완료"
      variant="primary"
      size="md"
      fullWidth
      backgroundColor={palette.theme.gray[90]}
      textColor={palette.white}
      textStyle={styles.confirmButtonText}
      style={styles.confirmButton}
      onPress={onConfirm}
      disabled={!selectedDate}
    />
  ) : (
    <>
      <Button title="취소" variant="ghost" size="sm" onPress={onCancel} />
      <Button
        title="확인"
        variant="primary"
        size="sm"
        onPress={onConfirm}
        disabled={!selectedDate}
      />
    </>
  );

  if (isInBottomSheet) {
    return (
      <>
        <BottomSheetHeader>{header}</BottomSheetHeader>
        <BottomSheetBody scrollEnabled={!isMonthPickerOpen}>
          {body}
        </BottomSheetBody>
        <BottomSheetFooter>{footer}</BottomSheetFooter>
      </>
    );
  }

  return (
    <ThemeView style={styles.container} transparent>
      <ThemeView style={styles.calendarSurface}>
        {header}
        {body}
      </ThemeView>
      <ThemeView transparent style={styles.footer}>
        {footer}
      </ThemeView>
    </ThemeView>
  );
};

export default DateCalendar;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  container: {
    gap: baseFoundation.dimension.x36,
  },
  calendarSurface: {
    padding: theme.foundation.spacing[3],
    gap: theme.foundation.spacing[1],
    borderRadius: theme.foundation.radii.s,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: baseFoundation.dimension.x36,
    minWidth: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    minHeight: baseFoundation.dimension.x36,
    paddingHorizontal: baseFoundation.spacing[0],
    borderRadius: baseFoundation.dimension.x6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.theme.gray[8],
    elevation: 0,
    shadowOpacity: 0,
  },
  monthTitle: {
    color: palette.theme.gray[90],
  },
  monthTitleButton: {
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[1],
    borderRadius: theme.foundation.radii.round,
  },
  dateArea: {
    gap: theme.foundation.spacing[2],
  },
  weekHeader: {
    flexDirection: 'row',
    height: baseFoundation.dimension.x32,
  },
  weekHeaderCell: {
    flex: 1,
    height: baseFoundation.dimension.x32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.foundation.spacing[2],
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: baseFoundation.dimension.x32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellOutsideMonth: {
    opacity: 1,
  },
  dayCellDisabled: {
    opacity: 1,
  },
  dayCellEnabled: {
    backgroundColor: 'transparent',
  },
  dayCellRangeBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.brand.card,
  },
  dayCellRangeStart: {
    left: '50%',
  },
  dayCellRangeEnd: {
    right: '50%',
  },
  dayNumber: {
    width: baseFoundation.dimension.x32,
    height: baseFoundation.dimension.x32,
    borderRadius: baseFoundation.dimension.x16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayNumberEnabled: {
    backgroundColor: 'transparent',
  },
  dayNumberToday: {
    borderWidth: 1,
    borderColor: theme.colors.action.primary.default,
    borderRadius: baseFoundation.dimension.x6,
  },
  dayNumberSelected: {
    borderRadius: baseFoundation.dimension.x6,
    backgroundColor: theme.colors.action.primary.default,
  },
  confirmButton: {
    height: baseFoundation.dimension.x44,
    minHeight: baseFoundation.dimension.x44,
  },
  confirmButtonText: {
    color: palette.white,
    fontSize: theme.foundation.typography.size.body2,
    fontWeight: theme.foundation.typography.weight.regular,
  },
  pickerColumns: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[4],
  },
  pickerColumn: {
    flex: 1,
  },
  wheelFrame: {
    height: PICKER_ITEM_HEIGHT * 5,
    borderRadius: theme.foundation.radii.l,
    backgroundColor: theme.colors.background.base,
    overflow: 'hidden',
  },
  wheelHighlight: {
    position: 'absolute',
    left: theme.foundation.spacing[2],
    right: theme.foundation.spacing[2],
    top: PICKER_ITEM_HEIGHT * 2,
    height: PICKER_ITEM_HEIGHT,
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    zIndex: 0,
  },
  wheelContent: {
    paddingVertical: PICKER_ITEM_HEIGHT * 2,
  },
  wheelItem: {
    height: PICKER_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  wheelItemText: {
    fontWeight: theme.foundation.typography.weight.medium,
  },
  wheelItemSelectedText: {
    fontWeight: theme.foundation.typography.weight.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.foundation.spacing[4],
  },
}));
