import Ionicons from '@expo/vector-icons/Ionicons';
import { getWeekMonday } from '@repo/shared/utils';
import type { Routine } from '@repo/types';
import { useCallback } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { Typography } from '@/components/ui/typography';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation, palette } from '@/theme/tokens';

interface RoutineCountListProps {
  routines: Routine[];
  date: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}

const ROUTINE_CARD_HEIGHT = 182;
const ROUTINE_TITLE_COLOR = '#DDEEFF';

const getRoutineItemLayout = (_: Routine[] | null, index: number) => ({
  length: ROUTINE_CARD_HEIGHT,
  offset: ROUTINE_CARD_HEIGHT * index,
  index,
});

const RoutineCountList = ({
  routines,
  date,
  refreshing = false,
  onRefresh,
  onShowRequestModal,
  onShowDetailModal,
}: RoutineCountListProps) => {
  const renderRoutineItem = useCallback<ListRenderItem<Routine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount } = routine;

      const countLabels = Array.from(
        { length: 7 },
        (_, index) => `${index + 1}회`,
      );

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
                    {countLabels.map((label) => (
                      <View key={`${routineId}-${label}`} style={styles.column}>
                        <Typography variant="caption2" style={styles.dayLabel}>
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
                          <View style={styles.checkBox}>
                            {achieved ? (
                              <Ionicons
                                name="checkmark"
                                size={baseFoundation.iconSize.s}
                                color={isGoalRange ? '#67B7FF' : '#FFD166'}
                              />
                            ) : !isGoalRange ? (
                              <Ionicons
                                name="remove"
                                size={baseFoundation.iconSize.s}
                                color="#40688D"
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
    [date, onShowDetailModal, onShowRequestModal],
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

export default RoutineCountList;

const styles = StyleSheet.create({
  list: {},
  cardContainer: {
    marginBottom: baseFoundation.spacing.xs,
  },
  cardOuter: {
    borderRadius: baseFoundation.dimension.x18,
    padding: baseFoundation.spacing.none,
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
    padding: baseFoundation.dimension.x2,
    borderRadius: baseFoundation.radii.m,
    backgroundColor: '#FFFFFF',
  },
  cardInner: {
    borderRadius: baseFoundation.dimension.x14,
    padding: baseFoundation.dimension.x3,
    backgroundColor: '#A9D6FF',
  },
  cardSurface: {
    borderRadius: baseFoundation.dimension.x10,
    minHeight: baseFoundation.dimension.x100,
    paddingHorizontal: baseFoundation.spacing.m,
    paddingTop: baseFoundation.dimension.x5,
    paddingBottom: baseFoundation.dimension.x5,
    backgroundColor: palette.blue[100],
    justifyContent: 'center',
  },
  titleButton: {
    paddingHorizontal: baseFoundation.spacing.none,
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
    marginBottom: baseFoundation.dimension.x3,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: baseFoundation.spacing.xs,
  },
  checkRow: {
    flexDirection: 'row',
    marginBottom: baseFoundation.dimension.x2,
  },
  column: {
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
    paddingHorizontal: baseFoundation.spacing.s,
    borderRadius: baseFoundation.dimension.x9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing.xs,
  },
  progressText: {
    color: '#EAF5FF',
  },
  requestButton: {
    position: 'absolute',
    right: 0,
    minWidth: baseFoundation.dimension.x72,
    height: baseFoundation.dimension.x20,
    borderRadius: baseFoundation.dimension.x10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  requestPlaceholder: {
    position: 'absolute',
    right: 0,
    width: baseFoundation.dimension.x72,
    height: baseFoundation.dimension.x20,
  },
});
