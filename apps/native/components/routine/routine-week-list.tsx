import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import type { Routine } from '@repo/types';
import { useCallback, useMemo } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
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
  openMenuRoutineId: number | null;
  onToggleRoutineMenu: (routineId: number) => void;
  onScrollOffsetChange?: (scrollOffset: number) => void;
  readOnly?: boolean;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DAYS_PER_WEEK = 7;
const SHORT_YEAR_OFFSET = 2000;
const PAD_LENGTH = 2;

const createWeekDateKeys = (startDate: string) => {
  const date = new Date(startDate);

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const weekDate = new Date(date);

    weekDate.setDate(weekDate.getDate() + index);

    const year = weekDate.getFullYear() - SHORT_YEAR_OFFSET;
    const month = (weekDate.getMonth() + 1)
      .toString()
      .padStart(PAD_LENGTH, '0');
    const day = weekDate.getDate().toString().padStart(PAD_LENGTH, '0');

    return `${year}${month}${day}`;
  });
};

const createRoutineDateKey = (date: Date) => {
  const year = date.getFullYear() - SHORT_YEAR_OFFSET;
  const month = (date.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
  const day = date.getDate().toString().padStart(PAD_LENGTH, '0');

  return `${year}${month}${day}`;
};

const getMissedPastCheckBoxStyle = (
  isMissedPast: boolean,
  missedBackgroundColor: string,
) => (isMissedPast ? { backgroundColor: missedBackgroundColor } : null);

const getUpcomingCheckBoxStyle = (isUpcoming: boolean, borderColor: string) =>
  isUpcoming
    ? {
        backgroundColor: 'transparent',
        borderColor,
        borderWidth: baseFoundation.dimension.x1,
      }
    : null;

const getTodaySuccessCheckBoxStyle = (isTodaySuccess: boolean) =>
  isTodaySuccess
    ? {
        borderColor: palette.theme.gray[5],
        borderWidth: baseFoundation.dimension.x1,
      }
    : null;

const getTodaySuccessFrameStyle = (
  isTodaySuccess: boolean,
  routineColor: string,
) => (isTodaySuccess ? { borderColor: routineColor } : null);

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
  openMenuRoutineId,
  onToggleRoutineMenu,
  onScrollOffsetChange,
  readOnly = false,
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
      const canRequestWithCheckBox = canRequestRoutine;
      const handlePressCheckBox = canRequestWithCheckBox
        ? () => onRequestRoutine(routine)
        : undefined;

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
          <View style={styles.titleRow}>
            <Typography variant="body3" weight="semibold" style={styles.title}>
              {routineName}
            </Typography>
          </View>

          {!readOnly ? (
            <>
              <View pointerEvents="none" style={styles.progressSummary}>
                <Typography
                  variant="caption3"
                  weight="semibold"
                  style={styles.progressSummaryText}
                  testID={`routine-week-progress-${routineId}`}
                >
                  {weeklyCount}/{routineCount}
                </Typography>
              </View>
              <RoutineContextMenuTrigger
                routineName={routineName}
                iconColor={theme.colors.text.secondary}
                onToggle={() => onToggleRoutineMenu(routineId)}
              />
            </>
          ) : null}

          <View style={styles.checkRow}>
            {weeklyData[routineId].map((check, index) => {
              const dateKey = weekDateKeys[index];
              const isPastDay = dateKey < todayDateKey;
              const isFutureDay = dateKey > todayDateKey;
              const isTodaySuccess = check && dateKey === todayDateKey;
              const isPendingConfirmation =
                !check &&
                routine.hasPendingConfirmation &&
                dateKey === todayDateKey;
              const isMissedPastDay =
                isPastDay && !check && !isPendingConfirmation;
              const isUpcomingDay =
                !isPastDay && !check && !isPendingConfirmation;
              const successCheckBoxStyle = check
                ? {
                    backgroundColor: symbolColor ?? DEFAULT_ROUTINE_COLOR,
                  }
                : null;
              const todaySuccessCheckBoxStyle =
                getTodaySuccessCheckBoxStyle(isTodaySuccess);
              const todaySuccessFrameStyle = getTodaySuccessFrameStyle(
                isTodaySuccess,
                symbolColor ?? DEFAULT_ROUTINE_COLOR,
              );
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
              const missedPastDayCheckBoxStyle = getMissedPastCheckBoxStyle(
                isMissedPastDay,
                theme.colors.brand.routineMissedCheckbox,
              );
              const futureDayTextStyle =
                isFutureDay && isUpcomingDay
                  ? {
                      color: theme.colors.brand.routineUpcomingCheckboxBorder,
                    }
                  : null;
              const statusLabel = check
                ? isTodaySuccess
                  ? '오늘 완료'
                  : '달성'
                : isPendingConfirmation
                  ? '요청 중'
                  : '미달성';

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
                    style={[styles.checkFrame, todaySuccessFrameStyle]}
                    testID={`routine-week-check-frame-${routineId}-${index}`}
                  >
                    <View
                      style={[
                        styles.checkBox,
                        successCheckBoxStyle,
                        todaySuccessCheckBoxStyle,
                        upcomingCheckBoxStyle,
                        pendingConfirmationCheckBoxStyle,
                        missedPastDayCheckBoxStyle,
                      ]}
                      testID={`routine-week-check-${routineId}-${index}`}
                    >
                      {isMissedPastDay ? (
                        <RoutineMissedIcon
                          size={baseFoundation.iconSize.xs}
                          color={palette.theme.gray[90]}
                        />
                      ) : (
                        <Typography
                          variant="caption2"
                          weight="semibold"
                          style={[styles.dayText, futureDayTextStyle]}
                        >
                          {DAY_LABELS[index]}
                        </Typography>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            {weeklyCount >= routineCount ? (
              <View
                style={styles.progressChip}
                accessibilityLabel="목표 달성 완료"
                accessibilityRole="image"
              >
                <RoutineCheckmarkIcon
                  size={baseFoundation.dimension.x14}
                  color={theme.colors.brand.selectedCheck}
                />
                <Typography variant="caption" style={styles.progressText}>
                  완료
                </Typography>
              </View>
            ) : (
              <View />
            )}
          </View>
        </View>
      );
    },
    [
      canRequestRoutine,
      itemHeight,
      onRequestRoutine,
      onToggleRoutineMenu,
      readOnly,
      theme.colors.brand.pendingConfirmationCheckbox,
      theme.colors.brand.routineMissedCheckbox,
      theme.colors.brand.routineUpcomingCheckboxBorder,
      theme.colors.brand.selectedCheck,
      theme.colors.text.secondary,
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
    position: 'relative',
    borderRadius: baseFoundation.radii.m,
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: theme.colors.brand.routineBackground,
    borderWidth: 2,
    borderColor: theme.colors.brand.routineBorder,
    shadowColor: theme.colors.brand.primary,
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text.secondary,
    textAlign: 'left',
  },
  titleRow: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: baseFoundation.dimension.x18,
    paddingRight: baseFoundation.spacing[14],
    marginBottom: baseFoundation.spacing[3],
  },
  progressSummary: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: baseFoundation.spacing[8],
    height: baseFoundation.dimension.x44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  progressSummaryText: {
    color: theme.colors.brand.routineProgressText,
  },
  checkRow: {
    flexDirection: 'row',
    marginBottom: baseFoundation.spacing[0.5],
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  checkFrame: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.dimension.x8,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: baseFoundation.dimension.x1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBox: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    borderRadius: baseFoundation.dimension.x6,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: baseFoundation.dimension.x0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: palette.theme.gray[90],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: baseFoundation.dimension.x8,
  },
  progressChip: {
    minWidth: baseFoundation.dimension.x58,
    height: baseFoundation.dimension.x18,
    paddingHorizontal: baseFoundation.spacing[2],
    borderRadius: baseFoundation.dimension.x9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing[1],
  },
  progressText: {
    color: theme.colors.text.secondary,
  },
}));
