import Ionicons from '@expo/vector-icons/Ionicons';
import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import { getDaysOfTheWeek, getWeekMonday } from '@repo/shared/utils';
import type { WeeklyRoutine } from '@repo/types';
import { useCallback } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelText } from '@/components/ui/pixel-text';
import type { ThemedViewProps } from '@/components/ui/theme-view';
import ThemeView from '@/components/ui/theme-view';

interface RoutineWeekListProps {
  routines: WeeklyRoutine[];
  date: string;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}

const ROUTINE_CARD_HEIGHT = 164;
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const WeekyView = (props: ThemedViewProps & { text?: string }) => {
  return (
    <ThemeView {...props} transparent>
      {props.text ? (
        <PixelText variant="label">{props.text}</PixelText>
      ) : (
        props.children
      )}
    </ThemeView>
  );
};

const getRoutineItemLayout = (_: WeeklyRoutine[] | null, index: number) => ({
  length: ROUTINE_CARD_HEIGHT,
  offset: ROUTINE_CARD_HEIGHT * index,
  index,
});

const RoutineWeekList = ({
  routines,
  date,
  onShowRequestModal,
  onShowDetailModal,
}: RoutineWeekListProps) => {
  const { theme } = useUnistyles();
  const weeklyData = useWeeklyData(routines);

  const renderRoutineItem = useCallback<ListRenderItem<WeeklyRoutine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount } = routine;
      let count = 0;

      return (
        <PixelCard style={styles.cardContainer}>
          <ThemeView style={styles.header}>
            <ThemeView transparent>
              <Button
                variant="ghost"
                onPress={() => onShowDetailModal(routineId)}
                style={styles.titleButton}
              >
                <PixelText
                  variant="body"
                  color={theme.colors.text.primary}
                  style={styles.title}
                >
                  {routineName}
                </PixelText>
              </Button>
            </ThemeView>
            <ThemeView transparent>
              {date === getWeekMonday(new Date()) && (
                <Button
                  title="인증 요청"
                  size="sm"
                  variant="secondary"
                  leftIcon={({ color }) => (
                    <Ionicons name="checkmark-circle" size={16} color={color} />
                  )}
                  onPress={() => onShowRequestModal(routineId)}
                />
              )}
            </ThemeView>
          </ThemeView>

          <ThemeView style={styles.table}>
            <ThemeView style={styles.row}>
              {getDaysOfTheWeek().map((day) => (
                <WeekyView
                  key={`${routineId}-header-${day}`}
                  text={day}
                  style={styles.column}
                />
              ))}
              <ThemeView style={styles.successRate}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.text.disabled}
                  style={styles.successRateIcon}
                />
              </ThemeView>
            </ThemeView>
            <Divider spacing={8} />
            <ThemeView style={styles.row} transparent>
              {weeklyData[routineId].map((check, index) => {
                count += +check;

                return check ? (
                  <WeekyView
                    key={`${routineId}-done-${index}`}
                    style={styles.column}
                    accessibilityLabel={`${DAY_LABELS[index]}요일 달성`}
                    accessibilityRole="image"
                  >
                    <Animated.View entering={ZoomIn.duration(300)}>
                      <Ionicons
                        name="checkbox"
                        size={24}
                        color={
                          count <= routineCount
                            ? theme.colors.action.primary.default
                            : theme.colors.feedback.warning.text
                        }
                      />
                    </Animated.View>
                  </WeekyView>
                ) : (
                  <WeekyView
                    key={`${routineId}-miss-${index}`}
                    style={styles.column}
                    accessibilityLabel={`${DAY_LABELS[index]}요일 미달성`}
                    accessibilityRole="image"
                  >
                    <Ionicons
                      name="square-outline"
                      size={24}
                      color={theme.colors.text.tertiary}
                    />
                  </WeekyView>
                );
              })}
              <ThemeView
                style={styles.successRate}
                transparent
                accessibilityLabel={
                  weeklyCount >= routineCount ? '목표 달성 완료' : '달성률'
                }
                accessibilityRole="image"
              >
                {weeklyCount >= routineCount ? (
                  <Animated.View entering={ZoomIn.duration(300)}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.feedback.success.text}
                    />
                  </Animated.View>
                ) : (
                  <PixelText variant="label">
                    {routineCount > 0
                      ? `${Math.round((weeklyCount / routineCount) * 100)}%`
                      : '0%'}
                  </PixelText>
                )}
              </ThemeView>
            </ThemeView>
          </ThemeView>
        </PixelCard>
      );
    },
    [
      date,
      onShowDetailModal,
      onShowRequestModal,
      theme.colors.action.primary.default,
      theme.colors.feedback.success.text,
      theme.colors.feedback.warning.text,
      theme.colors.text.disabled,
      theme.colors.text.tertiary,
      weeklyData,
    ],
  );

  return (
    <FlashList
      data={routines}
      renderItem={renderRoutineItem}
      keyExtractor={(item) => item.routineId.toString()}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
      estimatedItemSize={ROUTINE_CARD_HEIGHT}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={getRoutineItemLayout}
    />
  );
};

export default RoutineWeekList;

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.foundation.spacing.m,
  },
  cardContainer: {
    marginVertical: 0,
    marginBottom: theme.foundation.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.foundation.spacing.s,
    backgroundColor: 'transparent',
  },
  table: {
    gap: theme.foundation.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleButton: {
    padding: 0,
  },
  successRate: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successRateIcon: {
    borderRadius: 100,
  },
}));
