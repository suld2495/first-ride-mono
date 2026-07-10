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
  onRequestRoutine: (routine: Routine) => void;
  openMenuRoutineId: number | null;
  onToggleRoutineMenu: (routineId: number) => void;
  onScrollOffsetChange?: (scrollOffset: number) => void;
  readOnly?: boolean;
}

const MAX_ROUTINE_COUNT = 7;
const SHORT_YEAR_OFFSET = 2000;
const PAD_LENGTH = 2;

const createRoutineDateKey = (date: Date) => {
  const year = date.getFullYear() - SHORT_YEAR_OFFSET;
  const month = (date.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
  const day = date.getDate().toString().padStart(PAD_LENGTH, '0');

  return `${year}${month}${day}`;
};

const getMissedPastCheckBoxStyle = (
  isMissedPast: boolean,
  errorBackgroundColor: string,
) => (isMissedPast ? { backgroundColor: errorBackgroundColor } : null);

const getTodaySuccessCheckBoxStyle = (isTodaySuccess: boolean) =>
  isTodaySuccess
    ? {
        borderColor: palette.theme.gray[5],
        borderWidth: baseFoundation.dimension.x1,
      }
    : null;

const isUnachievedGoalCheckBox = (
  isGoalRange: boolean,
  achieved: boolean,
  isPendingConfirmation: boolean,
  isMissedPastGoal: boolean,
) => isGoalRange && !achieved && !isPendingConfirmation && !isMissedPastGoal;

const getUnachievedCheckBoxStyle = (isUnachieved: boolean) =>
  isUnachieved ? { backgroundColor: palette.theme.gray[80] } : null;

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
  onRequestRoutine,
  openMenuRoutineId,
  onToggleRoutineMenu,
  onScrollOffsetChange,
  readOnly = false,
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
      const pendingConfirmationCount = routine.hasPendingConfirmation
        ? routine.pendingConfirmationCount
        : 0;
      const canRequestWithCheckBox = canRequestRoutine;
      const handlePressCheckBox = canRequestWithCheckBox
        ? () => onRequestRoutine(routine)
        : undefined;
      const todayDateKey = createRoutineDateKey(new Date());
      const currentWeekStartDate = getWeekMonday(new Date());
      const isCurrentWeek = date === currentWeekStartDate;
      const isPastWeek = date < currentWeekStartDate;
      const hasTodaySuccess =
        isCurrentWeek && routine.successDate.includes(todayDateKey);

      const countLabels = Array.from(
        { length: MAX_ROUTINE_COUNT },
        (_, index) => `${index + 1}회`,
      );

      return (
        <View style={[styles.cardContainer, { height: itemHeight }]}>
          <View
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
                <Typography
                  variant="body3"
                  weight="semibold"
                  style={styles.title}
                >
                  {routineName}
                </Typography>
              </View>

              {!readOnly ? (
                <RoutineContextMenuTrigger
                  routineName={routineName}
                  iconColor={theme.colors.text.secondary}
                  onToggle={() => onToggleRoutineMenu(routineId)}
                />
              ) : null}

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
                        backgroundColor: symbolColor ?? DEFAULT_ROUTINE_COLOR,
                      }
                    : null;
                  const todaySuccessCheckBoxStyle =
                    getTodaySuccessCheckBoxStyle(isTodaySuccess);
                  const unachievedCheckBoxStyle =
                    getUnachievedCheckBoxStyle(isUnachievedGoal);
                  const pendingConfirmationCheckBoxStyle = isPendingConfirmation
                    ? {
                        backgroundColor:
                          theme.colors.brand.pendingConfirmationCheckbox,
                      }
                    : null;
                  const missedPastGoalCheckBoxStyle =
                    getMissedPastCheckBoxStyle(
                      isMissedPastGoal,
                      theme.colors.feedback.error.bg,
                    );
                  const label = getRoutineCountAccessibilityLabel({
                    countIndex,
                    isTodaySuccess,
                    achieved,
                    isPendingConfirmation,
                    isGoalRange,
                  });

                  return (
                    <Pressable
                      key={`${routineId}-status-${countIndex}`}
                      style={styles.column}
                      accessibilityLabel={label}
                      accessibilityRole={
                        canRequestWithCheckBox ? 'button' : 'image'
                      }
                      disabled={!canRequestWithCheckBox}
                      onPress={handlePressCheckBox}
                    >
                      <View
                        style={[
                          styles.checkBox,
                          achievedCheckBoxStyle,
                          todaySuccessCheckBoxStyle,
                          unachievedCheckBoxStyle,
                          pendingConfirmationCheckBoxStyle,
                          missedPastGoalCheckBoxStyle,
                        ]}
                        testID={`routine-count-check-${routineId}-${countIndex}`}
                      >
                        {isMissedPastGoal ? (
                          <RoutineMissedIcon
                            size={baseFoundation.iconSize.xs}
                            color={palette.theme.gray[90]}
                          />
                        ) : achieved || isPendingConfirmation ? (
                          <RoutineCheckmarkIcon
                            size={baseFoundation.iconSize.s}
                            color={palette.theme.gray[90]}
                          />
                        ) : !isGoalRange ? (
                          <Ionicons
                            testID={`routine-count-no-goal-icon-${routineId}-${countIndex}`}
                            name="remove"
                            size={baseFoundation.iconSize.s}
                            color={palette.theme.gray[90]}
                          />
                        ) : null}
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
      itemHeight,
      onRequestRoutine,
      onToggleRoutineMenu,
      readOnly,
      theme.colors.brand.pendingConfirmationCheckbox,
      theme.colors.feedback.error.bg,
      theme.colors.text.secondary,
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
    borderRadius: baseFoundation.dimension.x14,
    padding: baseFoundation.spacing.px,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
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
    borderRadius: baseFoundation.dimension.x12,
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: palette.theme.gray[95],
    borderColor: theme.colors.brand.primary,
    borderWidth: 3,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontSize: baseFoundation.typography.size.body3,
  },
  titleRow: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: baseFoundation.dimension.x18,
    marginBottom: baseFoundation.spacing[3],
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
  checkBox: {
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
    borderRadius: baseFoundation.dimension.x4,
    backgroundColor: theme.colors.brand.checkbox,
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
