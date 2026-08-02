import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import type { Routine } from '@repo/types';
import { useCallback, useMemo } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  RoutineCheckmarkIcon,
  RoutineMissedIcon,
} from '@/components/icons/routine-icons';
import { RoutineContextMenuTrigger } from '@/components/routine/routine-context-menu';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation, palette } from '@/theme/tokens';

interface RoutineWeekListProps {
  routines: Routine[];
  date: string;
  itemHeight: number;
  listHeight: number;
  scrollEnabled?: boolean;
  testID?: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  canRequestRoutine?: boolean;
  onRequestRoutine: (routine: Routine) => void;
  onBlockPastRoutineRequest: () => void;
  openMenuRoutineId: number | null;
  onToggleRoutineMenu: (routineId: number) => void;
  onScrollOffsetChange?: (scrollOffset: number) => void;
  readOnly?: boolean;
  routineColorFallback?: string;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DAYS_PER_WEEK = 7;
const PAD_LENGTH = 2;
const CHECKBOX_DAY_TEXT_COLOR = '#000306';
const UNCHECKED_BACKGROUND_COLOR = palette.theme.gray[95];
const TODAY_FRAME_COLOR = palette.white;
const TODAY_FRAME_BORDER_WIDTH = 1;
const TODAY_FRAME_GAP = 1;
const CHECKBOX_SIZE = baseFoundation.dimension.x24;
const CHECKBOX_ICON_SIZE = baseFoundation.iconSize.xs - 2;
const TODAY_FRAME_SIZE =
  CHECKBOX_SIZE + TODAY_FRAME_GAP * 2 + TODAY_FRAME_BORDER_WIDTH * 2;
const ROUTINE_HEADER_ITEM_HEIGHT = baseFoundation.dimension.x20;

const createWeekDateKeys = (startDate: string) => {
  const date = new Date(startDate);

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const weekDate = new Date(date);

    weekDate.setDate(weekDate.getDate() + index);

    const year = weekDate.getFullYear();
    const month = (weekDate.getMonth() + 1)
      .toString()
      .padStart(PAD_LENGTH, '0');
    const day = weekDate.getDate().toString().padStart(PAD_LENGTH, '0');

    return `${year}-${month}-${day}`;
  });
};

const createRoutineDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
  const day = date.getDate().toString().padStart(PAD_LENGTH, '0');

  return `${year}-${month}-${day}`;
};

const getPendingConfirmationDates = (
  pendingConfirmations: Routine['pendingConfirmations'],
) => {
  const dates = new Set<string>();

  for (const confirmation of pendingConfirmations ?? []) {
    if (confirmation.status === 'WAIT') {
      dates.add(confirmation.date);
    }
  }

  return dates;
};

const isPendingConfirmationForDate = ({
  check,
  dateKey,
  hasPendingConfirmation,
  pendingConfirmationDates,
  todayDateKey,
}: {
  check: boolean;
  dateKey: string;
  hasPendingConfirmation: boolean;
  pendingConfirmationDates: Set<string>;
  todayDateKey: string;
}) => {
  if (check) {
    return false;
  }

  if (pendingConfirmationDates.size > 0) {
    return pendingConfirmationDates.has(dateKey);
  }

  return hasPendingConfirmation && dateKey === todayDateKey;
};

const getRoutineDayState = ({
  check,
  dateKey,
  hasPendingConfirmation,
  pendingConfirmationDates,
  todayDateKey,
}: {
  check: boolean;
  dateKey: string;
  hasPendingConfirmation: boolean;
  pendingConfirmationDates: Set<string>;
  todayDateKey: string;
}) => {
  const isPastDay = dateKey < todayDateKey;
  const isToday = dateKey === todayDateKey;
  const isTodaySuccess = check && isToday;
  const isPendingConfirmation = isPendingConfirmationForDate({
    check,
    dateKey,
    hasPendingConfirmation,
    pendingConfirmationDates,
    todayDateKey,
  });
  const isMissedPastDay = isPastDay && !check && !isPendingConfirmation;
  const isUpcomingDay = !isPastDay && !check && !isPendingConfirmation;
  const statusLabel = check
    ? isTodaySuccess
      ? '오늘 완료'
      : '달성'
    : isPendingConfirmation
      ? '요청 중'
      : '미달성';

  return {
    isMissedPastDay,
    isPendingConfirmation,
    isToday,
    isUpcomingDay,
    statusLabel,
  };
};

const getUpcomingCheckBoxStyle = (isUpcoming: boolean, borderColor: string) =>
  isUpcoming
    ? {
        backgroundColor: UNCHECKED_BACKGROUND_COLOR,
        borderColor,
        borderWidth: baseFoundation.dimension.x1,
      }
    : null;

const getTodayFrameStyle = (isToday: boolean) =>
  isToday
    ? {
        borderColor: TODAY_FRAME_COLOR,
        borderWidth: TODAY_FRAME_BORDER_WIDTH,
      }
    : null;

const RoutineWeekList = ({
  routines,
  date,
  itemHeight,
  listHeight,
  scrollEnabled = true,
  testID,
  refreshing = false,
  onRefresh,
  canRequestRoutine = false,
  onRequestRoutine,
  onBlockPastRoutineRequest,
  openMenuRoutineId,
  onToggleRoutineMenu,
  onScrollOffsetChange,
  readOnly = false,
  routineColorFallback = DEFAULT_ROUTINE_COLOR,
}: RoutineWeekListProps) => {
  const { theme } = useAppTheme();
  const weeklyData = useWeeklyData(routines, date);
  const weekDateKeys = useMemo(() => createWeekDateKeys(date), [date]);
  const todayDateKey = createRoutineDateKey(new Date());
  const getRoutineItemLayout = useCallback(
    (_: Routine[] | null, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight],
  );
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollOffsetChange?.(event.nativeEvent.contentOffset.y);
    },
    [onScrollOffsetChange],
  );

  const renderRoutineItem = useCallback<ListRenderItem<Routine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount, symbolColor } =
        routine;
      const routineColor = symbolColor ?? routineColorFallback;
      const canRequestWithCheckBox = canRequestRoutine;
      const pendingConfirmationDates = getPendingConfirmationDates(
        routine.pendingConfirmations,
      );

      return (
        <View
          testID={`routine-week-card-outer-${routineId}`}
          style={[
            styles.cardOuter,
            {
              height: Math.max(itemHeight - baseFoundation.spacing[1], 0),
              marginBottom: baseFoundation.spacing[1],
            },
          ]}
        >
          <View
            testID={`routine-week-card-surface-${routineId}`}
            style={styles.cardSurface}
          >
            <View style={styles.titleRow}>
              <View style={styles.titleTextWrap}>
                <Typography
                  variant="body3"
                  weight="semibold"
                  style={styles.title}
                  numberOfLines={1}
                >
                  {routineName}
                </Typography>
              </View>
              <View style={readOnly ? styles.metaRowReadOnly : styles.metaRow}>
                <View
                  pointerEvents="none"
                  style={[
                    styles.progressSummary,
                    readOnly ? styles.progressSummaryReadOnly : null,
                  ]}
                  testID={`routine-week-progress-summary-${routineId}`}
                >
                  {weeklyCount >= routineCount ? (
                    <RoutineCheckmarkIcon
                      size={baseFoundation.dimension.x14}
                      color={palette.theme.green[50]}
                    />
                  ) : null}
                  <Typography
                    variant="caption2"
                    weight="semibold"
                    style={styles.progressSummaryText}
                    testID={`routine-week-progress-${routineId}`}
                  >
                    {weeklyCount}/{routineCount}
                  </Typography>
                </View>

                {!readOnly ? (
                  <RoutineContextMenuTrigger
                    routineName={routineName}
                    iconColor={theme.colors.brand.routineProgressText}
                    inline
                    onToggle={() => onToggleRoutineMenu(routineId)}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.checkRow}>
              {weeklyData[routineId].map((check, index) => {
                const dateKey = weekDateKeys[index];
                const {
                  isMissedPastDay,
                  isPendingConfirmation,
                  isToday,
                  isUpcomingDay,
                  statusLabel,
                } = getRoutineDayState({
                  check,
                  dateKey,
                  hasPendingConfirmation: routine.hasPendingConfirmation,
                  pendingConfirmationDates,
                  todayDateKey,
                });
                const successCheckBoxStyle = check
                  ? {
                      backgroundColor: routineColor,
                    }
                  : null;
                const todayFrameStyle = getTodayFrameStyle(isToday);
                const upcomingCheckBoxStyle = getUpcomingCheckBoxStyle(
                  isUpcomingDay,
                  theme.colors.brand.routineUpcomingCheckboxBorder,
                );
                const pendingConfirmationCheckBoxStyle = isPendingConfirmation
                  ? {
                      backgroundColor:
                        theme.colors.brand.pendingConfirmationCheckbox,
                    }
                  : null;
                const missedPastDayCheckBoxStyle = isMissedPastDay
                  ? {
                      backgroundColor: theme.colors.brand.routineMissedCheckbox,
                    }
                  : null;
                const dayTextColor = isUpcomingDay
                  ? theme.colors.brand.routineProgressText
                  : CHECKBOX_DAY_TEXT_COLOR;
                const handlePressCheckBox = canRequestWithCheckBox
                  ? isMissedPastDay
                    ? onBlockPastRoutineRequest
                    : () => onRequestRoutine(routine)
                  : undefined;

                return (
                  <Pressable
                    key={`${routineId}-status-${index}`}
                    style={styles.dayColumn}
                    accessibilityLabel={`${DAY_LABELS[index]}요일 ${statusLabel}`}
                    accessibilityRole={
                      canRequestWithCheckBox ? 'button' : 'image'
                    }
                    disabled={!canRequestWithCheckBox}
                    onPress={handlePressCheckBox}
                  >
                    <View
                      style={[styles.checkFrame, todayFrameStyle]}
                      testID={`routine-week-check-frame-${routineId}-${index}`}
                    >
                      <View
                        style={[
                          styles.checkBox,
                          successCheckBoxStyle,
                          upcomingCheckBoxStyle,
                          pendingConfirmationCheckBoxStyle,
                          missedPastDayCheckBoxStyle,
                        ]}
                        testID={`routine-week-check-${routineId}-${index}`}
                      >
                        {isMissedPastDay ? (
                          <RoutineMissedIcon
                            size={CHECKBOX_ICON_SIZE}
                            color={theme.colors.brand.routineProgressText}
                          />
                        ) : (
                          <Text
                            style={[styles.dayText, { color: dayTextColor }]}
                          >
                            {DAY_LABELS[index]}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.footer} />
          </View>
        </View>
      );
    },
    [
      canRequestRoutine,
      itemHeight,
      onBlockPastRoutineRequest,
      onRequestRoutine,
      onToggleRoutineMenu,
      readOnly,
      routineColorFallback,
      theme.colors.brand.pendingConfirmationCheckbox,
      theme.colors.brand.routineMissedCheckbox,
      theme.colors.brand.routineUpcomingCheckboxBorder,
      theme.colors.brand.routineProgressText,
      todayDateKey,
      weekDateKeys,
      weeklyData,
    ],
  );

  return (
    <FlashList
      data={routines}
      renderItem={renderRoutineItem}
      keyExtractor={(item) => item.routineId.toString()}
      style={{ height: listHeight }}
      contentContainerStyle={styles.list}
      drawDistance={0}
      estimatedItemSize={itemHeight}
      extraData={openMenuRoutineId}
      getItemLayout={getRoutineItemLayout}
      removeClippedSubviews={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
      alwaysBounceVertical={Boolean(onRefresh)}
      onScroll={handleScroll}
      scrollEnabled={scrollEnabled}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      maxToRenderPerBatch={10}
      windowSize={5}
      testID={testID}
    />
  );
};

export default RoutineWeekList;

const styles = StyleSheet.create((theme) => ({
  list: {},
  cardOuter: {
    borderRadius: baseFoundation.radii.m,
    shadowColor: theme.colors.brand.primary,
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSurface: {
    flex: 1,
    position: 'relative',
    borderRadius: baseFoundation.radii.m,
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: theme.colors.brand.routineBackground,
    borderWidth: 2,
    borderColor: theme.colors.brand.routineBorder,
    justifyContent: 'center',
  },
  title: {
    color: palette.white,
    textAlign: 'left',
    lineHeight: ROUTINE_HEADER_ITEM_HEIGHT,
    includeFontPadding: false,
  },
  titleTextWrap: {
    flex: 1,
    height: ROUTINE_HEADER_ITEM_HEIGHT,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: ROUTINE_HEADER_ITEM_HEIGHT,
    marginBottom: baseFoundation.spacing[3],
    gap: baseFoundation.spacing[2],
  },
  metaRow: {
    height: ROUTINE_HEADER_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing[3],
  },
  metaRowReadOnly: {
    height: ROUTINE_HEADER_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  progressSummary: {
    height: ROUTINE_HEADER_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing[1],
  },
  progressSummaryReadOnly: {
    marginLeft: 'auto',
  },
  progressSummaryText: {
    color: theme.colors.brand.routineProgressText,
    lineHeight: ROUTINE_HEADER_ITEM_HEIGHT,
    includeFontPadding: false,
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseFoundation.spacing[0.5],
  },
  dayColumn: {
    width: TODAY_FRAME_SIZE,
    alignItems: 'center',
  },
  checkFrame: {
    width: TODAY_FRAME_SIZE,
    height: TODAY_FRAME_SIZE,
    borderRadius: baseFoundation.dimension.x8,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: TODAY_FRAME_BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: baseFoundation.dimension.x6,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: baseFoundation.dimension.x0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: CHECKBOX_DAY_TEXT_COLOR,
    fontSize: baseFoundation.typography.size.caption2,
    fontWeight: baseFoundation.typography.weight.semibold,
  },
  footer: {
    minHeight: baseFoundation.dimension.x0,
  },
}));
