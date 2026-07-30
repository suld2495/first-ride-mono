import type { RoutineMonthlySummary } from '@repo/types';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';
import { baseFoundation, palette } from '@/theme/tokens';
import { calculateMonthlyRoutineStats } from '@/utils/routine-stats';

type RoutineStatsSummaryItem = {
  id: RoutineMonthlySummary['routineId'];
  routineName: string;
  routineColor: string;
  totalDotCount: number;
  completedIndexes: readonly number[];
};

export interface RoutineStatsSummaryProps {
  monthDate: Date;
  routines: readonly RoutineMonthlySummary[];
}

type DotProps = {
  completed: boolean;
  fireworksTestID?: string;
  routineColor: string;
  trackColor: string;
  testID?: string;
};

type SummaryItemProps = {
  item: RoutineStatsSummaryItem;
};

const DOTS_PER_ROW = 7;
const DOT_SIZE = baseFoundation.dimension.x36;
const DOT_GAP = baseFoundation.spacing[2];
const ROW_GAP = baseFoundation.spacing[2];
const TRACK_LINE_WIDTH = 1;
const ROW_WIDTH = DOTS_PER_ROW * DOT_SIZE + (DOTS_PER_ROW - 1) * DOT_GAP;
const ROUTINE_COMPLETION_FIREWORKS =
  require('@/assets/stat/routine-completion-fireworks.png') as ImageSourcePropType;

const getDotRows = (totalDotCount: number) => {
  const dotIndexes = Array.from({ length: totalDotCount }, (_, index) => index);
  const rows: number[][] = [];

  for (let index = 0; index < dotIndexes.length; index += DOTS_PER_ROW) {
    rows.push(dotIndexes.slice(index, index + DOTS_PER_ROW));
  }

  return rows;
};

const getCompletedDotIndexes = (
  totalDotCount: number,
  completedDotCount: number,
) =>
  Array.from(
    { length: Math.min(totalDotCount, completedDotCount) },
    (_, index) => index,
  );

const Dot = ({
  completed,
  fireworksTestID,
  routineColor,
  trackColor,
  testID,
}: DotProps) => (
  <View
    style={[
      styles.dot,
      { borderColor: trackColor },
      completed ? { backgroundColor: routineColor } : styles.dotEmpty,
    ]}
    testID={testID}
  >
    {fireworksTestID ? (
      <View
        pointerEvents="none"
        style={styles.fireworksContainer}
        testID={fireworksTestID}
      >
        <Image
          resizeMode="contain"
          source={ROUTINE_COMPLETION_FIREWORKS}
          style={styles.fireworksIcon}
        />
      </View>
    ) : null}
  </View>
);

const SummaryItem = ({ item }: SummaryItemProps) => {
  const { theme } = useAppTheme();
  const trackColor = theme.colors.text.soft;
  const completedSet = React.useMemo(
    () => new Set(item.completedIndexes),
    [item.completedIndexes],
  );
  const dotRows = React.useMemo(
    () => getDotRows(item.totalDotCount),
    [item.totalDotCount],
  );

  return (
    <ThemeView
      transparent
      style={styles.item}
      testID={`routine-stats-summary-item-${item.id}`}
    >
      <Typography
        variant="body1"
        weight="bold"
        color={palette.theme.gray[700]}
        style={styles.routineTitle}
      >
        {item.routineName}
      </Typography>

      <ThemeView
        transparent
        style={styles.progressPanel}
        testID={`routine-stats-summary-track-${item.id}`}
      >
        <View style={styles.track}>
          {dotRows.map((row, rowIndex) => {
            const isLastRow = rowIndex === dotRows.length - 1;
            const isReverseRow = rowIndex % 2 === 1;
            const displayRow = isReverseRow ? [...row].reverse() : row;
            const rowLineWidth = Math.max(
              0,
              (row.length - 1) * (DOT_SIZE + DOT_GAP),
            );
            const terminalDotIndex =
              rowIndex % 2 === 0 ? row[row.length - 1] : row[0];
            const connectorSide =
              rowIndex % 2 === 0
                ? styles.rowTurnConnectorRight
                : styles.rowTurnConnectorLeft;

            return (
              <View
                key={`row-${rowIndex}`}
                style={[
                  styles.trackRow,
                  isReverseRow && styles.trackRowReverse,
                ]}
                testID={`routine-stats-summary-track-row-${item.id}-${rowIndex}`}
              >
                {row.length > 1 ? (
                  <View
                    style={[
                      styles.rowLine,
                      isReverseRow ? styles.rowLineRight : styles.rowLineLeft,
                      {
                        backgroundColor: trackColor,
                        width: rowLineWidth,
                      },
                    ]}
                    testID={`routine-stats-summary-row-line-${item.id}-${rowIndex}`}
                  />
                ) : null}
                {!isLastRow ? (
                  <View
                    style={[
                      styles.rowTurnConnector,
                      connectorSide,
                      { borderColor: trackColor },
                    ]}
                    testID={`routine-stats-summary-turn-connector-${item.id}-${rowIndex}`}
                  />
                ) : null}
                {displayRow.map((index) => (
                  <Dot
                    key={index}
                    completed={completedSet.has(index)}
                    fireworksTestID={
                      isLastRow && index === terminalDotIndex
                        ? `routine-stats-summary-fireworks-${item.id}-${index}`
                        : undefined
                    }
                    routineColor={item.routineColor}
                    trackColor={trackColor}
                    testID={`routine-stats-summary-dot-${item.id}-${index}`}
                  />
                ))}
              </View>
            );
          })}
        </View>
      </ThemeView>
    </ThemeView>
  );
};

const RoutineStatsSummary = ({
  monthDate,
  routines,
}: RoutineStatsSummaryProps) => {
  const summaryItems = React.useMemo<RoutineStatsSummaryItem[]>(
    () =>
      routines.flatMap((routine) => {
        const achievedDates = Array.isArray(routine.achievedDates)
          ? routine.achievedDates.filter(
              (date): date is string => typeof date === 'string',
            )
          : [];
        const { totalAvailableCount, achievedCount } =
          calculateMonthlyRoutineStats({
            monthDate,
            startDate: routine.startDate,
            endDate: routine.endDate,
            routineCount: routine.routineCount,
            successDates: achievedDates,
          });

        if (totalAvailableCount === 0) {
          return [];
        }

        const completedDotCount = Math.min(achievedCount, totalAvailableCount);

        return [
          {
            id: routine.routineId,
            routineName: routine.routineName || '이름 없는 루틴',
            routineColor:
              typeof routine.symbolColor === 'string' &&
              routine.symbolColor.trim()
                ? routine.symbolColor
                : DEFAULT_ROUTINE_COLOR,
            totalDotCount: totalAvailableCount,
            completedIndexes: getCompletedDotIndexes(
              totalAvailableCount,
              completedDotCount,
            ),
          },
        ];
      }),
    [monthDate, routines],
  );

  return (
    <ThemeView
      transparent
      style={styles.container}
      testID="routine-stats-summary"
    >
      {summaryItems.map((item) => (
        <SummaryItem key={item.id} item={item} />
      ))}
    </ThemeView>
  );
};

export default RoutineStatsSummary;

const styles = StyleSheet.create((theme) => {
  return {
    container: {
      gap: theme.foundation.spacing[6],
    },
    item: {
      gap: theme.foundation.spacing[3],
    },
    routineTitle: {
      paddingVertical: 7,
    },
    progressPanel: {
      position: 'relative',
      paddingHorizontal: theme.foundation.spacing[3],
      paddingTop: theme.foundation.spacing[2],
      paddingBottom: 0,
    },
    track: {
      width: ROW_WIDTH,
      alignSelf: 'center',
      gap: ROW_GAP,
    },
    trackRow: {
      position: 'relative',
      width: ROW_WIDTH,
      minHeight: baseFoundation.dimension.x36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: DOT_GAP,
    },
    rowLine: {
      position: 'absolute',
      top: baseFoundation.dimension.x18,
      height: TRACK_LINE_WIDTH,
    },
    rowLineLeft: {
      left: baseFoundation.dimension.x18,
    },
    trackRowReverse: {
      justifyContent: 'flex-end',
    },
    rowLineRight: {
      right: baseFoundation.dimension.x18,
    },
    rowTurnConnector: {
      position: 'absolute',
      top: baseFoundation.dimension.x18,
      width: baseFoundation.dimension.x36,
      height: DOT_SIZE + ROW_GAP,
      borderTopWidth: TRACK_LINE_WIDTH,
      borderBottomWidth: TRACK_LINE_WIDTH,
    },
    rowTurnConnectorRight: {
      right: -baseFoundation.dimension.x18,
      borderRightWidth: TRACK_LINE_WIDTH,
      borderTopRightRadius: baseFoundation.dimension.x24,
      borderBottomRightRadius: baseFoundation.dimension.x24,
    },
    rowTurnConnectorLeft: {
      left: -baseFoundation.dimension.x18,
      borderLeftWidth: TRACK_LINE_WIDTH,
      borderTopLeftRadius: baseFoundation.dimension.x24,
      borderBottomLeftRadius: baseFoundation.dimension.x24,
    },
    dot: {
      width: baseFoundation.dimension.x36,
      height: baseFoundation.dimension.x36,
      borderRadius: baseFoundation.dimension.x18,
      borderWidth: TRACK_LINE_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotEmpty: {
      backgroundColor: theme.colors.background.base,
    },
    fireworksContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fireworksIcon: {
      width: baseFoundation.dimension.x28,
      height: baseFoundation.dimension.x28,
    },
  };
});
