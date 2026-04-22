import Ionicons from '@expo/vector-icons/Ionicons';
import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import type { WeeklyRoutine } from '@repo/types';
import { useCallback } from 'react';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { Typography } from '@/components/ui/typography';

interface RoutineWeekListProps {
  routines: WeeklyRoutine[];
  date: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}

const ROUTINE_CARD_HEIGHT = 182;
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const ROUTINE_TITLE_COLOR = '#DDEEFF';

const getRoutineItemLayout = (_: WeeklyRoutine[] | null, index: number) => ({
  length: ROUTINE_CARD_HEIGHT,
  offset: ROUTINE_CARD_HEIGHT * index,
  index,
});

const RoutineWeekList = ({
  routines,
  date,
  refreshing = false,
  onRefresh,
  onShowRequestModal,
  onShowDetailModal,
}: RoutineWeekListProps) => {
  const weeklyData = useWeeklyData(routines);

  const renderRoutineItem = useCallback<ListRenderItem<WeeklyRoutine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount } = routine;
      let count = 0;

      return (
        <View style={styles.cardContainer}>
          <View style={styles.cardOuter}>
            <View style={styles.cardGap}>
              <View style={styles.cardInner}>
                <View style={styles.cardSurface}>
                  <View style={styles.titleRow}>
                    <Button
                      variant="ghost"
                      onPress={() => onShowDetailModal(routineId)}
                      style={styles.titleButton}
                    >
                      <Typography variant="body3" style={styles.title}>
                        {routineName}
                      </Typography>
                    </Button>

                    {date === getWeekMonday(new Date()) ? (
                      <Button
                        title="인증 요청"
                        size="sm"
                        variant="ghost"
                        onPress={() => onShowRequestModal(routineId)}
                        textColor="#DDEEFF"
                        style={styles.requestButton}
                      />
                    ) : (
                      <View style={styles.requestPlaceholder} />
                    )}
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
                                size={16}
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
                            size={14}
                            color="#67B7FF"
                          />
                          <Typography variant="caption" style={styles.progressText}>
                            완료
                          </Typography>
                        </>
                      </View>
                    ) : weeklyCount > 0 && routineCount > 0 ? (
                      <View
                        style={styles.progressChip}
                        accessibilityLabel="달성률"
                        accessibilityRole="image"
                      >
                        <Typography variant="caption" style={styles.progressText}>
                          {`${Math.round((weeklyCount / routineCount) * 100)}%`}
                        </Typography>
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
    [date, onShowDetailModal, onShowRequestModal, weeklyData],
  );

  return (
    <FlashList
      data={routines}
      renderItem={renderRoutineItem}
      keyExtractor={(item) => item.routineId.toString()}
      contentContainerStyle={styles.list}
      estimatedItemSize={ROUTINE_CARD_HEIGHT}
      getItemLayout={getRoutineItemLayout}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default RoutineWeekList;

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingBottom: 84,
  },
  cardContainer: {
    marginBottom: 4,
  },
  cardOuter: {
    borderRadius: 18,
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0D3154',
    shadowColor: '#14477D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGap: {
    padding: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardInner: {
    borderRadius: 14,
    padding: 3,
    backgroundColor: '#A9D6FF',
  },
  cardSurface: {
    borderRadius: 10,
    minHeight: 112,
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 7,
    backgroundColor: '#0D3154',
    justifyContent: 'center',
  },
  titleButton: {
    paddingHorizontal: 0,
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
    minHeight: 18,
    marginBottom: 3,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  checkRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    color: '#6A98C4',
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#071B31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 8,
  },
  progressChip: {
    minWidth: 58,
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  progressText: {
    color: '#EAF5FF',
  },
  requestButton: {
    position: 'absolute',
    right: 0,
    minWidth: 72,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  requestPlaceholder: {
    position: 'absolute',
    right: 0,
    width: 72,
    height: 20,
  },
}));
