import Ionicons from '@expo/vector-icons/Ionicons';
import { getWeekMonday } from '@repo/shared/utils';
import type { Routine } from '@repo/types';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface RoutineCountListProps {
  routines: Routine[];
  date: string;
  itemHeight: number;
  listHeight: number;
  scrollEnabled?: boolean;
  testID?: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
  readOnly?: boolean;
}

const ROUTINE_CHECKMARK_WIDTH = 12;
const ROUTINE_CHECKMARK_HEIGHT = 9;
const ROUTINE_CHECKMARK_SCALE = 0.7;

interface RoutineCheckmarkIconProps {
  color: string;
  size: number;
}

const RoutineCheckmarkIcon = ({ color, size }: RoutineCheckmarkIconProps) => {
  const scaledWidth = size * ROUTINE_CHECKMARK_SCALE;
  const scaledHeight =
    (scaledWidth * ROUTINE_CHECKMARK_HEIGHT) / ROUTINE_CHECKMARK_WIDTH;

  return (
    <Svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${ROUTINE_CHECKMARK_WIDTH} ${ROUTINE_CHECKMARK_HEIGHT}`}
      fill="none"
    >
      <Path
        d="M1.25 4.91667L3.69444 7.36111L9.80556 1.25"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
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
  onShowRequestModal,
  onShowDetailModal,
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

  const renderRoutineItem = useCallback<ListRenderItem<Routine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount } = routine;

      const countLabels = Array.from(
        { length: 7 },
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
            <View style={styles.cardSurface}>
              <View style={styles.titleRow}>
                {readOnly ? (
                  <Typography
                    variant="body3"
                    weight="semibold"
                    style={styles.title}
                  >
                    {routineName}
                  </Typography>
                ) : (
                  <Pressable
                    onPress={() => onShowDetailModal(routineId)}
                    style={styles.titleButton}
                    accessibilityRole="button"
                    accessibilityLabel={`${routineName} 상세 보기`}
                    hitSlop={baseFoundation.dimension.x8}
                  >
                    <Typography
                      variant="body3"
                      weight="semibold"
                      style={styles.title}
                    >
                      {routineName}
                    </Typography>
                  </Pressable>
                )}

                {!readOnly && date === getWeekMonday(new Date()) ? (
                  <Button
                    title="인증 요청"
                    size="sm"
                    variant="ghost"
                    onPress={() => onShowRequestModal(routineId)}
                    textColor="#DDEEFF"
                    style={styles.requestButton}
                  />
                ) : !readOnly ? (
                  <View style={styles.requestPlaceholder} />
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
                {Array.from({ length: 7 }, (_, index) => {
                  const countIndex = index + 1;
                  const achieved = countIndex <= weeklyCount;
                  const isGoalRange = countIndex <= routineCount;
                  const label = achieved
                    ? countIndex <= routineCount
                      ? `${countIndex}회 달성`
                      : `${countIndex}회 초과 달성`
                    : isGoalRange
                      ? `${countIndex}회 미달성`
                      : `${countIndex}회 목표 없음`;

                  return (
                    <View
                      key={`${routineId}-status-${countIndex}`}
                      style={styles.column}
                      accessibilityLabel={label}
                      accessibilityRole="image"
                    >
                      <View
                        style={[
                          styles.checkBox,
                          achieved ? styles.achievedCheckBox : '',
                        ]}
                      >
                        {isGoalRange ? (
                          <RoutineCheckmarkIcon
                            size={baseFoundation.iconSize.s}
                            color={
                              isGoalRange
                                ? theme.colors.brand.selectedCheck
                                : theme.colors.brand.check
                            }
                          />
                        ) : (
                          <Ionicons
                            name="remove"
                            size={baseFoundation.iconSize.s}
                            color={theme.colors.brand.check}
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [date, itemHeight, onShowDetailModal, onShowRequestModal, readOnly],
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
      getItemLayout={getRoutineItemLayout}
      removeClippedSubviews={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
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
    borderColor: '#0D3154',
    shadowColor: '#14477D',
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
    borderRadius: baseFoundation.dimension.x12,
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: theme.colors.brand.routineBackground,
    borderColor: theme.colors.brand.primary,
    borderWidth: 3,
    justifyContent: 'center',
  },
  titleButton: {
    paddingHorizontal: baseFoundation.spacing[0],
    alignSelf: 'center',
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
    marginBottom: baseFoundation.spacing[2],
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
  achievedCheckBox: {
    backgroundColor: theme.colors.brand.selectedCheckbox,
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
    color: '#EAF5FF',
  },
  requestButton: {
    position: 'absolute',
    right: baseFoundation.spacing[0],
    minWidth: baseFoundation.dimension.x72,
    height: baseFoundation.dimension.x20,
    borderRadius: baseFoundation.dimension.x10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  requestPlaceholder: {
    position: 'absolute',
    right: baseFoundation.spacing[0],
    width: baseFoundation.dimension.x72,
    height: baseFoundation.dimension.x20,
  },
}));
