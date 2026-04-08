import Ionicons from '@expo/vector-icons/Ionicons';
import { isMonday } from '@repo/shared/utils';
import React from 'react';
import {
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';
import { StyleSheet, type UnistylesThemes } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import {
  FlashList,
  type FlashListRef,
  type ListRenderItem,
} from '@/components/ui/flash-list';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';

interface QuestStartDateCalendarProps {
  minimumDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const PICKER_ITEM_HEIGHT = 44;

const formatMonthLabel = (date: Date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
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
  const firstCell = new Date(start);

  firstCell.setDate(start.getDate() - startWeekday);

  return Array.from({ length: 42 }, (_, index) => {
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

const QuestStartDateCalendar = ({
  minimumDate,
  selectedDate,
  onSelectDate,
  onConfirm,
  onCancel,
}: QuestStartDateCalendarProps) => {
  const yearListRef = React.useRef<FlashListRef<number>>(null);
  const monthListRef = React.useRef<FlashListRef<number>>(null);
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    getMonthStart(selectedDate ?? minimumDate),
  );
  const [isMonthPickerOpen, setIsMonthPickerOpen] = React.useState(false);
  const [draftYear, setDraftYear] = React.useState(currentMonth.getFullYear());
  const [draftMonth, setDraftMonth] = React.useState(currentMonth.getMonth());
  const minDate = getStartOfDay(minimumDate);
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const cells = getMonthCells(currentMonth);
  const yearOptions = getYearOptions(minimumDate);

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

  return (
    <ThemeView style={styles.container} transparent>
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
            <Ionicons name="chevron-back" size={18} color={color} />
          )}
          style={styles.monthButton}
        />
        <Pressable
          onPress={openMonthPicker}
          accessibilityLabel="년월 선택 열기"
          style={styles.monthTitleButton}
        >
          <Typography variant="subtitle" style={styles.monthTitle}>
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
            <Ionicons name="chevron-forward" size={18} color={color} />
          )}
          style={styles.monthButton}
        />
      </ThemeView>

      {isMonthPickerOpen ? (
        <ThemeView transparent style={styles.pickerSection}>
          <ThemeView transparent style={styles.pickerColumns}>
            <View style={styles.pickerColumn}>
              <View style={styles.wheelFrame}>
                <View pointerEvents="none" style={styles.wheelHighlight} />
                <FlashList
                  ref={yearListRef}
                  data={yearOptions}
                  keyExtractor={(item) => `${item}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={PICKER_ITEM_HEIGHT}
                  decelerationRate="fast"
                  getItemLayout={getPickerItemLayout}
                  initialScrollIndex={yearInitialIndex}
                  onMomentumScrollEnd={handleYearScrollEnd}
                  contentContainerStyle={styles.wheelContent}
                  estimatedItemSize={PICKER_ITEM_HEIGHT}
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
                  showsVerticalScrollIndicator={false}
                  snapToInterval={PICKER_ITEM_HEIGHT}
                  decelerationRate="fast"
                  getItemLayout={getPickerItemLayout}
                  initialScrollIndex={monthInitialIndex}
                  onMomentumScrollEnd={handleMonthScrollEnd}
                  contentContainerStyle={styles.wheelContent}
                  estimatedItemSize={PICKER_ITEM_HEIGHT}
                  removeClippedSubviews
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  renderItem={renderMonthItem}
                />
              </View>
            </View>
          </ThemeView>

          <ThemeView transparent style={styles.footer}>
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
          </ThemeView>
        </ThemeView>
      ) : (
        <>
          <ThemeView transparent style={styles.weekHeader}>
            {WEEKDAY_LABELS.map((label) => (
              <View key={label} style={styles.weekHeaderCell}>
                <Typography variant="caption" color="secondary">
                  {label}
                </Typography>
              </View>
            ))}
          </ThemeView>

          <ThemeView transparent style={styles.grid}>
            {cells.map((date) => {
              const inCurrentMonth =
                date.getMonth() === currentMonth.getMonth();
              const dateKey = formatDateKey(date);
              const isSelectable =
                isMonday(date) &&
                getStartOfDay(date).getTime() >= minDate.getTime();
              const isSelected = selectedKey === dateKey;

              return (
                <Pressable
                  key={dateKey}
                  accessibilityLabel={`${dateKey} ${isSelectable ? '선택 가능' : '선택 불가'}`}
                  disabled={!isSelectable}
                  onPress={() => onSelectDate(getStartOfDay(date))}
                  style={[
                    styles.dayCell,
                    !inCurrentMonth &&
                      !isSelectable &&
                      styles.dayCellOutsideMonth,
                    !isSelectable && inCurrentMonth && styles.dayCellDisabled,
                    isSelectable && styles.dayCellEnabled,
                  ]}
                >
                  <View
                    style={[
                      styles.dayNumber,
                      isSelectable && styles.dayNumberEnabled,
                      isSelected && styles.dayNumberSelected,
                    ]}
                  >
                    <Typography
                      variant="label"
                      color={
                        isSelected
                          ? 'inverse'
                          : isSelectable
                            ? 'primary'
                            : 'tertiary'
                      }
                    >
                      {date.getDate()}
                    </Typography>
                  </View>
                </Pressable>
              );
            })}
          </ThemeView>
        </>
      )}

      {!isMonthPickerOpen && (
        <ThemeView transparent style={styles.footer}>
          <Button title="취소" variant="ghost" size="sm" onPress={onCancel} />
          <Button
            title="확인"
            variant="primary"
            size="sm"
            onPress={onConfirm}
            disabled={!selectedDate}
          />
        </ThemeView>
      )}
    </ThemeView>
  );
};

export default QuestStartDateCalendar;

const styles = StyleSheet.create((theme: UnistylesThemes['light']) => ({
  container: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.foundation.radii.xl,
    padding: theme.foundation.spacing.m,
    gap: theme.foundation.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    shadowColor: theme.colors.border.strong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 0,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  monthTitle: {
    fontWeight: theme.foundation.typography.weight.bold,
  },
  monthTitleButton: {
    paddingHorizontal: theme.foundation.spacing.m,
    paddingVertical: theme.foundation.spacing.xs,
    borderRadius: theme.foundation.radii.round,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingVertical: theme.foundation.spacing.xs,
    paddingHorizontal: theme.foundation.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.foundation.spacing.xs,
    columnGap: theme.foundation.spacing.xs,
  },
  dayCell: {
    width: '13.2%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellOutsideMonth: {
    opacity: 0.16,
  },
  dayCellDisabled: {
    opacity: 0.28,
  },
  dayCellEnabled: {
    backgroundColor: 'transparent',
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberEnabled: {
    backgroundColor: 'transparent',
  },
  dayNumberSelected: {
    backgroundColor: theme.colors.action.primary.default,
    shadowColor: theme.colors.action.primary.default,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerSection: {
    gap: theme.foundation.spacing.m,
  },
  pickerColumns: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.m,
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
    left: theme.foundation.spacing.s,
    right: theme.foundation.spacing.s,
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
    gap: theme.foundation.spacing.m,
  },
}));
