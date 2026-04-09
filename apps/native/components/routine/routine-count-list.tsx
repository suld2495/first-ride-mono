import Ionicons from '@expo/vector-icons/Ionicons';
import { getWeekMonday } from '@repo/shared/utils';
import type { Routine } from '@repo/types';
import { useCallback } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelText } from '@/components/ui/pixel-text';
import type { ThemedViewProps } from '@/components/ui/theme-view';
import ThemeView from '@/components/ui/theme-view';

interface RoutineCountListProps {
  routines: Routine[];
  date: string;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}

const ROUTINE_CARD_HEIGHT = 164;

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

const getRoutineItemLayout = (_: Routine[] | null, index: number) => ({
  length: ROUTINE_CARD_HEIGHT,
  offset: ROUTINE_CARD_HEIGHT * index,
  index,
});

const RoutineCountList = ({
  routines,
  date,
  onShowRequestModal,
  onShowDetailModal,
}: RoutineCountListProps) => {
  const { theme } = useUnistyles();

  const renderRoutineItem = useCallback<ListRenderItem<Routine>>(
    ({ item: routine }) => {
      const { routineId, routineName, weeklyCount, routineCount } = routine;

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

          <ThemeView style={styles.table} transparent>
            <ThemeView style={styles.row} transparent>
              {Array.from({ length: 7 }, (_, index) => (
                <WeekyView
                  key={`${routineId}-header-${index + 1}`}
                  text={`${index + 1}회`}
                  style={styles.column}
                />
              ))}
              <ThemeView style={styles.successRate} transparent>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.feedback.success.text}
                  style={styles.successRateIcon}
                />
              </ThemeView>
            </ThemeView>

            <ThemeView style={styles.row}>
              {Array.from(
                { length: Math.min(~~weeklyCount, routineCount) },
                (_, index) => (
                  <WeekyView
                    key={`${routineId}-done-${index + 1}`}
                    style={styles.column}
                    accessibilityLabel={`${index + 1}회 달성`}
                    accessibilityRole="image"
                  >
                    <Animated.View entering={ZoomIn.duration(300)}>
                      <Ionicons
                        name="checkbox"
                        size={24}
                        color={theme.colors.action.primary.default}
                      />
                    </Animated.View>
                  </WeekyView>
                ),
              )}

              {Array.from(
                { length: Math.max(~~weeklyCount - routineCount, 0) },
                (_, index) => {
                  const countIndex = routineCount + index + 1;

                  return (
                    <WeekyView
                      key={`${routineId}-extra-${countIndex}`}
                      style={styles.column}
                      accessibilityLabel={`${countIndex}회 초과 달성`}
                      accessibilityRole="image"
                    >
                      <Animated.View entering={ZoomIn.duration(300)}>
                        <Ionicons
                          name="checkbox"
                          size={24}
                          color={theme.colors.feedback.warning.text}
                        />
                      </Animated.View>
                    </WeekyView>
                  );
                },
              )}

              {Array.from(
                { length: Math.max(routineCount - ~~weeklyCount, 0) },
                (_, index) => {
                  const countIndex = ~~weeklyCount + index + 1;

                  return (
                    <WeekyView
                      key={`${routineId}-miss-${countIndex}`}
                      style={styles.column}
                      accessibilityLabel={`${countIndex}회 미달성`}
                      accessibilityRole="image"
                    >
                      <Ionicons
                        name="square-outline"
                        size={24}
                        color={theme.colors.text.tertiary}
                      />
                    </WeekyView>
                  );
                },
              )}

              {Array.from(
                { length: 7 - Math.max(routineCount, ~~weeklyCount) },
                (_, index) => {
                  const countIndex =
                    Math.max(routineCount, ~~weeklyCount) + index + 1;

                  return (
                    <WeekyView
                      key={`${routineId}-empty-${countIndex}`}
                      style={styles.column}
                      accessibilityLabel={`${countIndex}회 목표 없음`}
                      accessibilityRole="image"
                    >
                      <Ionicons
                        name="remove-outline"
                        size={24}
                        color={theme.colors.text.disabled}
                      />
                    </WeekyView>
                  );
                },
              )}
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

export default RoutineCountList;

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
