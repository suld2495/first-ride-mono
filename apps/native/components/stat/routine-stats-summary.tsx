import React from 'react';
import {
  Image,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

type RoutineStatsSummaryItem = {
  id: string;
  routineName: string;
  achievedLabel: string;
  totalDotCount: number;
  completedIndexes: readonly number[];
};

type DotProps = {
  completed: boolean;
  testID?: string;
};

type ProgressMarkerProps = {
  style?: StyleProp<ViewStyle>;
};

type SummaryItemProps = {
  item: RoutineStatsSummaryItem;
  isLast: boolean;
};

const DOTS_PER_ROW = 7;
const TRACK_LINE_WIDTH = 1;

const getRoutineTrackColors = (themeName: string) => {
  if (themeName === 'green') {
    return {
      checked: palette.theme.green[50],
      track: palette.theme.softGreen[50],
    };
  }

  if (themeName === 'red') {
    return {
      checked: palette.theme.red[50],
      track: palette.theme.softRed[50],
    };
  }

  return {
    checked: palette.theme.blue[50],
    track: palette.theme.softBlue[50],
  };
};

const SAMPLE_SUMMARY_ITEMS: readonly RoutineStatsSummaryItem[] = [
  {
    id: 'exercise',
    routineName: '운동 주 3회',
    achievedLabel: '3회 달성',
    totalDotCount: 14,
    completedIndexes: [0, 1, 2, 3, 4, 5, 8, 10, 11],
  },
  {
    id: 'instrument',
    routineName: '악기연습 주 5회',
    achievedLabel: '5회 달성',
    totalDotCount: 21,
    completedIndexes: [0, 2, 4, 9, 10, 11, 13, 15, 18],
  },
] as const;

const PROGRESS_MARKER_IMAGE =
  require('@/assets/stat/routine-progress-marker.png') as ImageSourcePropType;

const getDotRows = (totalDotCount: number) => {
  const dotIndexes = Array.from({ length: totalDotCount }, (_, index) => index);
  const rows: number[][] = [];

  for (let index = 0; index < dotIndexes.length; index += DOTS_PER_ROW) {
    rows.push(dotIndexes.slice(index, index + DOTS_PER_ROW));
  }

  return rows;
};

const Dot = ({ completed, testID }: DotProps) => (
  <View
    style={[styles.dot, completed ? styles.dotCompleted : styles.dotEmpty]}
    testID={testID}
  />
);

const ProgressMarker = ({ style }: ProgressMarkerProps) => (
  <View style={[styles.progressMarker, style]}>
    <Image
      source={PROGRESS_MARKER_IMAGE}
      style={styles.progressMarkerImage}
      resizeMode="contain"
      testID="routine-stats-summary-progress-marker"
      accessibilityIgnoresInvertColors
    />
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
                  style={styles.rowLine}
                  testID={`routine-stats-summary-row-line-${item.id}-${rowIndex}`}
                />
                {!isLastRow ? (
                  <View
                    style={[styles.rowTurnConnector, connectorSide]}
                    testID={`routine-stats-summary-turn-connector-${item.id}-${rowIndex}`}
                  />
                ) : null}
                {row.map((index) => (
                  <Dot
                    key={index}
                    completed={completedSet.has(index)}
                    testID={`routine-stats-summary-dot-${item.id}-${index}`}
                  />
                ))}
              </View>
            );
          })}
        </View>
        <ProgressMarker style={styles.panelProgressMarker} />
      </ThemeView>

      <ThemeView transparent style={styles.achievementPill}>
        <Typography
          variant="body1"
          weight="bold"
          color={palette.theme.gray[700]}
        >
          {item.achievedLabel}
        </Typography>
        <ProgressMarker />
      </ThemeView>

      {!isLast ? <View style={styles.divider} /> : null}
    </ThemeView>
  );
};

const RoutineStatsSummary = () => {
  return (
    <ThemeView
      transparent
      style={styles.container}
      testID="routine-stats-summary"
    >
      {SAMPLE_SUMMARY_ITEMS.map((item, index) => (
        <SummaryItem
          key={item.id}
          item={item}
          isLast={index === SAMPLE_SUMMARY_ITEMS.length - 1}
        />
      ))}
    </ThemeView>
  );
};

export default RoutineStatsSummary;

const styles = StyleSheet.create((theme) => {
  const trackColors = getRoutineTrackColors(theme.name);

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
      minHeight: baseFoundation.dimension.x120,
      paddingHorizontal: theme.foundation.spacing[3],
      paddingTop: theme.foundation.spacing[2],
      paddingBottom: theme.foundation.spacing[1],
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
      backgroundColor: trackColors.track,
    },
    rowTurnConnector: {
      position: 'absolute',
      top: baseFoundation.dimension.x18,
      width: baseFoundation.dimension.x36,
      height: baseFoundation.dimension.x48,
      borderColor: trackColors.track,
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
      borderColor: trackColors.track,
    },
    dotCompleted: {
      backgroundColor: trackColors.checked,
    },
    dotEmpty: {
      backgroundColor: theme.colors.background.base,
      opacity: 0.7,
    },
    progressMarker: {
      width: baseFoundation.dimension.x28,
      height: baseFoundation.dimension.x28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressMarkerImage: {
      width: 26,
      height: 33,
    },
    panelProgressMarker: {
      position: 'absolute',
      right: theme.foundation.spacing[2],
      bottom: theme.foundation.spacing[3],
    },
    achievementPill: {
      minHeight: baseFoundation.dimension.x28,
      borderRadius: baseFoundation.dimension.x8,
      backgroundColor: palette.white,
      paddingHorizontal: theme.foundation.spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.foundation.spacing[2],
    },
    divider: {
      height: TRACK_LINE_WIDTH,
      backgroundColor: trackColors.track,
      marginTop: theme.foundation.spacing[1],
    },
  };
});
