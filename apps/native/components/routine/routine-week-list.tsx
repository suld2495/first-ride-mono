import Ionicons from '@expo/vector-icons/Ionicons';
import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import type { WeeklyRoutine } from '@repo/types';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { Typography } from '@/components/ui/typography';

interface RoutineWeekListProps {
  routines: WeeklyRoutine[];
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

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const ROUTINE_TITLE_COLOR = '#DDEEFF';

const RoutineWeekList = ({
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
}: RoutineWeekListProps) => {
  const weeklyData = useWeeklyData(routines, date);
  const getRoutineItemLayout = useCallback(
    (_: WeeklyRoutine[] | null, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight],
  );

  const renderRoutineItem = useCallback<ListRenderItem<WeeklyRoutine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount } = routine;
      let count = 0;

      return (
        <View style={[styles.cardContainer, { height: itemHeight }]}>
          <View
            style={[
              styles.cardOuter,
              { height: Math.max(itemHeight - baseFoundation.spacing[1], 0) },
            ]}
          >
            <View style={styles.cardGap}>
              <View style={styles.cardInner}>
                <View style={styles.cardSurface}>
                  <View style={styles.titleRow}>
                    {readOnly ? (
                      <Typography variant="body3" style={styles.title}>
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
                        <Typography variant="body3" style={styles.title}>
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
                    {DAY_LABELS.map((day) => (
                      <View
                        key={`${routineId}-header-${day}`}
                        style={styles.dayColumn}
                      >
                        <Typography variant="caption2" style={styles.dayLabel}>
                          {day}
                        </Typography>
                      </View>
                    ))}
                  </View>

                  <View style={styles.checkRow}>
                    {weeklyData[routineId].map((check, index) => {
                      count += +check;
                      const isGoalRange = count <= routineCount;

                      return (
                        <View
                          key={`${routineId}-status-${index}`}
                          style={styles.dayColumn}
                          accessibilityLabel={`${DAY_LABELS[index]}요일 ${
                            check ? '달성' : '미달성'
                          }`}
                          accessibilityRole="image"
                        >
                          <View style={styles.checkBox}>
                            {check ? (
                              <Ionicons
                                name="checkmark"
                                size={baseFoundation.iconSize.s}
                                color={isGoalRange ? '#67B7FF' : '#FFD166'}
                              />
                            ) : null}
                          </View>
                        </View>
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
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={baseFoundation.dimension.x14}
                            color="#67B7FF"
                          />
                          <Typography
                            variant="caption"
                            style={styles.progressText}
                          >
                            완료
                          </Typography>
                        </>
                      </View>
                    ) : (
                      <View />
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    },
    [
      date,
      itemHeight,
      onShowDetailModal,
      onShowRequestModal,
      readOnly,
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

export default RoutineWeekList;

const styles = StyleSheet.create({
  list: {},
  cardContainer: {
    justifyContent: 'center',
  },
  cardOuter: {
    borderRadius: baseFoundation.dimension.x18,
    padding: baseFoundation.spacing[0],
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
  cardGap: {
    flex: 1,
    padding: baseFoundation.spacing[0.5],
    borderRadius: baseFoundation.radii.m,
    backgroundColor: '#FFFFFF',
  },
  cardInner: {
    flex: 1,
    borderRadius: baseFoundation.dimension.x14,
    padding: baseFoundation.spacing[0.5],
    backgroundColor: '#A9D6FF',
  },
  cardSurface: {
    flex: 1,
    borderRadius: baseFoundation.dimension.x10,
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: '#0D3154',
    justifyContent: 'center',
  },
  titleButton: {
    paddingHorizontal: baseFoundation.spacing[0],
    alignSelf: 'center',
  },
  title: {
    color: ROUTINE_TITLE_COLOR,
    textAlign: 'center',
  },
  titleRow: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: baseFoundation.dimension.x18,
    marginBottom: baseFoundation.spacing[0.5],
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: baseFoundation.spacing[1],
  },
  checkRow: {
    flexDirection: 'row',
    marginBottom: baseFoundation.spacing[0.5],
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    color: '#6A98C4',
  },
  checkBox: {
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
    borderRadius: baseFoundation.dimension.x4,
    backgroundColor: '#071B31',
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
});
