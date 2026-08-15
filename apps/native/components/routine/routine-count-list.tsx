import Ionicons from '@expo/vector-icons/Ionicons';
import { getWeekMonday } from '@repo/shared/utils';
import type { Routine } from '@repo/types';
import { useCallback } from 'react';
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

interface RoutineCountListProps {
  routines: Routine[];
  date: string;
  itemHeight: number;
  listHeight: number;
  scrollEnabled?: boolean;
  testID?: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  canRequestRoutine?: boolean;
  canOpenRoutineProofDetail?: boolean;
  onRequestRoutine: (
    routine: Routine,
    meta?: {
      confirmId?: number | null;
      isMissedPast?: boolean;
    },
  ) => void;
  openMenuRoutineId: number | null;
  onToggleRoutineMenu: (routineId: number) => void;
  onScrollOffsetChange?: (scrollOffset: number) => void;
  readOnly?: boolean;
  routineColorFallback?: string;
}

const MAX_ROUTINE_COUNT = 7;
const PAD_LENGTH = 2;
const CHECKED_ICON_COLOR = palette.theme.gray[95];
const UNCHECKED_BACKGROUND_COLOR = palette.theme.gray[95];
const TODAY_FRAME_COLOR = palette.white;
const TODAY_FRAME_BORDER_WIDTH = 1;
const TODAY_FRAME_GAP = 1;
const CHECKBOX_SIZE = baseFoundation.dimension.x20;
const CHECKBOX_ICON_SIZE = baseFoundation.iconSize.xs - 2;
const CHECKBOX_CHECK_ICON_SIZE = baseFoundation.iconSize.s - 2;
const TODAY_FRAME_SIZE =
  CHECKBOX_SIZE + TODAY_FRAME_GAP * 2 + TODAY_FRAME_BORDER_WIDTH * 2;
const ROUTINE_COUNT_CARD_SURFACE_RADIUS = baseFoundation.dimension.x12;
const ROUTINE_HEADER_ITEM_HEIGHT = baseFoundation.dimension.x20;

const createRoutineDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
  const day = date.getDate().toString().padStart(PAD_LENGTH, '0');

  return `${year}-${month}-${day}`;
};

const addDaysToDateKey = (dateKey: string, days: number) => {
  const date = new Date(dateKey);

  date.setDate(date.getDate() + days);

  return createRoutineDateKey(date);
};

const getPassedConfirmIdsInWeek = (
  confirmations: Routine['confirmations'],
  weekStartDate: string,
) => {
  const weekEndDate = addDaysToDateKey(weekStartDate, 7);

  return confirmations
    .filter(
      (confirmation) =>
        confirmation.status === 'PASS' &&
        confirmation.date >= weekStartDate &&
        confirmation.date < weekEndDate,
    )
    .sort((current, next) => current.date.localeCompare(next.date))
    .map((confirmation) => confirmation.confirmId);
};

const getTodaySuccessFrameStyle = (isTodaySuccess: boolean) =>
  isTodaySuccess
    ? {
        borderColor: TODAY_FRAME_COLOR,
        borderWidth: TODAY_FRAME_BORDER_WIDTH,
      }
    : null;

const isUnachievedGoalCheckBox = (
  isGoalRange: boolean,
  achieved: boolean,
  isPendingConfirmation: boolean,
  isMissedPastGoal: boolean,
) => isGoalRange && !achieved && !isPendingConfirmation && !isMissedPastGoal;

const getUnachievedCheckBoxStyle = (
  isUnachieved: boolean,
  borderColor: string,
) =>
  isUnachieved
    ? {
        backgroundColor: UNCHECKED_BACKGROUND_COLOR,
        borderColor,
        borderWidth: baseFoundation.dimension.x1,
      }
    : null;

const getRoutineCountAccessibilityLabel = ({
  countIndex,
  isTodaySuccess,
  achieved,
  isPendingConfirmation,
  isGoalRange,
}: {
  countIndex: number;
  isTodaySuccess: boolean;
  achieved: boolean;
  isPendingConfirmation: boolean;
  isGoalRange: boolean;
}) => {
  if (isTodaySuccess) {
    return `${countIndex}회 오늘 완료`;
  }

  if (achieved) {
    return isGoalRange ? `${countIndex}회 달성` : `${countIndex}회 초과 달성`;
  }

  if (isPendingConfirmation) {
    return `${countIndex}회 요청 중`;
  }

  return isGoalRange ? `${countIndex}회 미달성` : `${countIndex}회 목표 없음`;
};

const RoutineCountList = ({
  routines,
  date,
  itemHeight,
  listHeight,
  scrollEnabled = true,
  testID,
  refreshing = false,
  onRefresh,
  canRequestRoutine = false,
  canOpenRoutineProofDetail = false,
  onRequestRoutine,
  openMenuRoutineId,
  onToggleRoutineMenu,
  onScrollOffsetChange,
  readOnly = false,
  routineColorFallback = DEFAULT_ROUTINE_COLOR,
}: RoutineCountListProps) => {
  const { theme } = useAppTheme();
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
      const pendingConfirmationCount = routine.hasPendingConfirmation
        ? routine.pendingConfirmationCount
        : 0;
      const canRequestWithCheckBox = canRequestRoutine;
      const todayDateKey = createRoutineDateKey(new Date());
      const currentWeekStartDate = getWeekMonday(new Date());
      const isCurrentWeek = date === currentWeekStartDate;
      const isPastWeek = date < currentWeekStartDate;
      const todayPassedConfirmation = routine.confirmations.find(
        (confirmation) =>
          confirmation.date === todayDateKey && confirmation.status === 'PASS',
      );
      const passedConfirmIds = getPassedConfirmIdsInWeek(
        routine.confirmations,
        date,
      );
      const hasTodaySuccess = isCurrentWeek && Boolean(todayPassedConfirmation);

      const countLabels = Array.from(
        { length: MAX_ROUTINE_COUNT },
        (_, index) => `${index + 1}회`,
      );

      return (
        <View style={[styles.cardContainer, { height: itemHeight }]}>
          <View
            testID={`routine-count-card-outer-${routineId}`}
            style={[
              styles.cardOuter,
              { height: Math.max(itemHeight - baseFoundation.spacing[1], 0) },
            ]}
          >
            <View
              testID={`routine-count-card-surface-${routineId}`}
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

                {!readOnly ? (
                  <RoutineContextMenuTrigger
                    routineName={routineName}
                    iconColor={theme.colors.brand.routineProgressText}
                    inline
                    onToggle={() => onToggleRoutineMenu(routineId)}
                  />
                ) : null}
              </View>

              <View style={styles.headerRow}>
                {countLabels.map((label) => (
                  <View key={`${routineId}-${label}`} style={styles.column}>
                    <Typography
                      variant="caption2"
                      weight="semibold"
                      style={styles.dayLabel}
                    >
                      {label}
                    </Typography>
                  </View>
                ))}
              </View>

              <View style={styles.checkRow}>
                {Array.from({ length: MAX_ROUTINE_COUNT }, (_, index) => {
                  const countIndex = index + 1;
                  const achieved = countIndex <= weeklyCount;
                  const isPendingConfirmation =
                    !achieved &&
                    countIndex <= weeklyCount + pendingConfirmationCount;
                  const isGoalRange = countIndex <= routineCount;
                  const isMissedPastGoal =
                    isPastWeek &&
                    isGoalRange &&
                    !achieved &&
                    !isPendingConfirmation;
                  const isTodaySuccess =
                    achieved && hasTodaySuccess && countIndex === weeklyCount;
                  const isUnachievedGoal = isUnachievedGoalCheckBox(
                    isGoalRange,
                    achieved,
                    isPendingConfirmation,
                    isMissedPastGoal,
                  );
                  const achievedCheckBoxStyle = achieved
                    ? {
                        backgroundColor: routineColor,
                      }
                    : null;
                  const todaySuccessFrameStyle =
                    getTodaySuccessFrameStyle(isTodaySuccess);
                  const unachievedCheckBoxStyle = getUnachievedCheckBoxStyle(
                    isUnachievedGoal,
                    theme.colors.brand.routineUpcomingCheckboxBorder,
                  );
                  const pendingConfirmationCheckBoxStyle = isPendingConfirmation
                    ? {
                        backgroundColor:
                          theme.colors.brand.pendingConfirmationCheckbox,
                      }
                    : null;
                  const missedPastGoalCheckBoxStyle = isMissedPastGoal
                    ? {
                        backgroundColor:
                          theme.colors.brand.routineMissedCheckbox,
                      }
                    : null;
                  const label = getRoutineCountAccessibilityLabel({
                    countIndex,
                    isTodaySuccess,
                    achieved,
                    isPendingConfirmation,
                    isGoalRange,
                  });
                  const confirmId = achieved
                    ? (passedConfirmIds[countIndex - 1] ??
                      (isTodaySuccess
                        ? (todayPassedConfirmation?.confirmId ??
                          (routine.todayConfirmStatus === 'PASS'
                            ? routine.todayConfirmId
                            : null))
                        : null))
                    : isPendingConfirmation
                      ? (routine.pendingConfirmationIds[
                          countIndex - weeklyCount - 1
                        ] ?? null)
                      : null;
                  const canPressWithCheckBox =
                    canRequestWithCheckBox ||
                    (canOpenRoutineProofDetail && Boolean(confirmId));
                  const handlePressCheckBox = canPressWithCheckBox
                    ? () =>
                        onRequestRoutine(routine, {
                          confirmId,
                          isMissedPast: isMissedPastGoal,
                        })
                    : undefined;

                  return (
                    <Pressable
                      key={`${routineId}-status-${countIndex}`}
                      style={styles.column}
                      accessibilityLabel={label}
                      accessibilityRole={
                        canPressWithCheckBox ? 'button' : 'image'
                      }
                      disabled={!canPressWithCheckBox}
                      onPress={handlePressCheckBox}
                    >
                      <View
                        style={[styles.checkFrame, todaySuccessFrameStyle]}
                        testID={`routine-count-check-frame-${routineId}-${countIndex}`}
                      >
                        <View
                          style={[
                            styles.checkBox,
                            achievedCheckBoxStyle,
                            unachievedCheckBoxStyle,
                            pendingConfirmationCheckBoxStyle,
                            missedPastGoalCheckBoxStyle,
                          ]}
                          testID={`routine-count-check-${routineId}-${countIndex}`}
                        >
                          {isMissedPastGoal ? (
                            <RoutineMissedIcon
                              size={CHECKBOX_ICON_SIZE}
                              color={theme.colors.brand.routineProgressText}
                            />
                          ) : achieved || isPendingConfirmation ? (
                            <RoutineCheckmarkIcon
                              size={CHECKBOX_CHECK_ICON_SIZE}
                              color={CHECKED_ICON_COLOR}
                            />
                          ) : !isGoalRange ? (
                            <Ionicons
                              testID={`routine-count-no-goal-icon-${routineId}-${countIndex}`}
                              name="remove"
                              size={CHECKBOX_CHECK_ICON_SIZE}
                              color={
                                theme.colors.brand.routineUpcomingCheckboxBorder
                              }
                            />
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [
      date,
      canRequestRoutine,
      canOpenRoutineProofDetail,
      itemHeight,
      onRequestRoutine,
      onToggleRoutineMenu,
      readOnly,
      routineColorFallback,
      theme.colors.brand.pendingConfirmationCheckbox,
      theme.colors.brand.routineProgressText,
      theme.colors.brand.routineUpcomingCheckboxBorder,
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

export default RoutineCountList;

const styles = StyleSheet.create((theme) => ({
  list: {},
  cardContainer: {
    justifyContent: 'center',
  },
  cardOuter: {
    borderRadius: ROUTINE_COUNT_CARD_SURFACE_RADIUS,
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
    borderRadius: ROUTINE_COUNT_CARD_SURFACE_RADIUS,
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: palette.theme.gray[95],
    borderColor: theme.colors.brand.primary,
    borderWidth: 3,
    justifyContent: 'center',
  },
  title: {
    color: palette.white,
    textAlign: 'left',
    fontSize: baseFoundation.typography.size.body3,
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
  headerRow: {
    flexDirection: 'row',
    marginBottom: baseFoundation.spacing[1],
  },
  checkRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    color: theme.colors.text.tertiary,
    fontSize: baseFoundation.typography.size.caption2,
  },
  checkFrame: {
    width: TODAY_FRAME_SIZE,
    height: TODAY_FRAME_SIZE,
    borderRadius: baseFoundation.dimension.x6,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: TODAY_FRAME_BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: baseFoundation.dimension.x4,
    backgroundColor: theme.colors.brand.checkbox,
    borderColor: 'transparent',
    borderWidth: baseFoundation.dimension.x0,
    justifyContent: 'center',
    alignItems: 'center',
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
