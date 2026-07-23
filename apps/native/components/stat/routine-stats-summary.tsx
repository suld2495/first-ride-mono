import type { RoutineMonthlySummary } from '@repo/types';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, View } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
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
  testID?: string;
};

type SummaryItemProps = {
  item: RoutineStatsSummaryItem;
  isLast: boolean;
};

const DOTS_PER_ROW = 7;
const TRACK_LINE_WIDTH = 1;
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
  getDotRows(totalDotCount)
    .flatMap((row, rowIndex) =>
      rowIndex % 2 === 0
        ? row
        : row.map((_value, index) => row[row.length - index - 1]),
    )
    .slice(0, completedDotCount);

const Dot = ({
  completed,
  fireworksTestID,
  routineColor,
  testID,
}: DotProps) => (
  <View
    style={[
      styles.dot,
      { borderColor: routineColor },
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

const SummaryItem = ({ item, isLast }: SummaryItemProps) => {
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
            const terminalDotIndex =
              rowIndex % 2 === 0 ? row[row.length - 1] : row[0];
            const connectorSide =
              rowIndex % 2 === 0
                ? styles.rowTurnConnectorRight
                : styles.rowTurnConnectorLeft;

            return (
              <View
                key={`row-${rowIndex}`}
                style={styles.trackRow}
                testID={`routine-stats-summary-track-row-${item.id}-${rowIndex}`}
              >
                <View
                  style={[
                    styles.rowLine,
                    { backgroundColor: item.routineColor },
                  ]}
                  testID={`routine-stats-summary-row-line-${item.id}-${rowIndex}`}
                />
                {!isLastRow ? (
                  <View
                    style={[
                      styles.rowTurnConnector,
                      connectorSide,
                      { borderColor: item.routineColor },
                    ]}
                    testID={`routine-stats-summary-turn-connector-${item.id}-${rowIndex}`}
                  />
                ) : null}
                {row.map((index) => (
                  <Dot
                    key={index}
                    completed={completedSet.has(index)}
                    fireworksTestID={
                      isLastRow && index === terminalDotIndex
                        ? `routine-stats-summary-fireworks-${item.id}-${index}`
                        : undefined
                    }
                    routineColor={item.routineColor}
                    testID={`routine-stats-summary-dot-${item.id}-${index}`}
                  />
                ))}
              </View>
            );
          })}
        </View>
      </ThemeView>

      {!isLast ? (
        <View
          style={[styles.divider, { backgroundColor: item.routineColor }]}
        />
      ) : null}
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
        const { totalAvailableCount, achievedCount } =
          calculateMonthlyRoutineStats({
            monthDate,
            startDate: routine.startDate,
            endDate: routine.endDate,
            routineCount: routine.routineCount,
            successDates: routine.achievedDates,
          });

        if (totalAvailableCount === 0) {
          return [];
        }

        const completedDotCount = Math.min(achievedCount, totalAvailableCount);

        return [
          {
            id: routine.routineId,
            routineName: routine.routineName,
            routineColor: routine.symbolColor ?? DEFAULT_ROUTINE_COLOR,
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
      {summaryItems.map((item, index) => (
        <SummaryItem
          key={item.id}
          item={item}
          isLast={index === summaryItems.length - 1}
        />
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
      gap: theme.foundation.spacing[3],
    },
    trackRow: {
      position: 'relative',
      minHeight: baseFoundation.dimension.x36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowLine: {
      position: 'absolute',
      left: baseFoundation.dimension.x18,
      right: baseFoundation.dimension.x18,
      top: baseFoundation.dimension.x18,
      height: TRACK_LINE_WIDTH,
    },
    rowTurnConnector: {
      position: 'absolute',
      top: baseFoundation.dimension.x18,
      width: baseFoundation.dimension.x36,
      height: baseFoundation.dimension.x48,
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
      opacity: 0.7,
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
    divider: {
      height: TRACK_LINE_WIDTH,
      marginTop: theme.foundation.spacing[1],
    },
  };
});
