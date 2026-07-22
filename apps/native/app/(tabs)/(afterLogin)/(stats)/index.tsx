import Ionicons from '@expo/vector-icons/Ionicons';
import { useMonthlyRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import type { RoutineMonthlySummary } from '@repo/types';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import StatsMonthChevronIcon from '@/components/icons/stats-month-chevron-icon';
import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import RoutineStatsCalendar from '@/components/stat/routine-stats-calendar';
import RoutineStatsSummary from '@/components/stat/routine-stats-summary';
import EmptyState from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation, palette } from '@/theme/tokens';
import { normalizeRoutineDateKey } from '@/utils/routine-stats';

const ROUTINE_STATS_CALENDAR_ESTIMATED_SIZE = 300;
const ROUTINE_STATS_CALENDAR_SEPARATOR_HEIGHT = 28;
const ROUTINE_STATS_CALENDAR_ITEM_INTERVAL =
  ROUTINE_STATS_CALENDAR_ESTIMATED_SIZE +
  ROUTINE_STATS_CALENDAR_SEPARATOR_HEIGHT;
const MONTH_HEADER_VERTICAL_PADDING = 10;
const EMPTY_MONTHLY_ROUTINES: RoutineMonthlySummary[] = [];
type StatsViewMode = 'calendar' | 'summary';

const getMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const formatMonthLabel = (date: Date) => {
  return `${date.getMonth() + 1}월`;
};

const getPerformedDates = (routine: RoutineMonthlySummary) => {
  return routine.achievedDates.map(normalizeRoutineDateKey);
};

const getRoutineCalendarItemLayout = (
  _: RoutineMonthlySummary[] | null,
  index: number,
) => ({
  length: ROUTINE_STATS_CALENDAR_ESTIMATED_SIZE,
  offset: ROUTINE_STATS_CALENDAR_ITEM_INTERVAL * index,
  index,
});

const renderRoutineCalendarSeparator = () => (
  <View
    style={styles.routineCalendarSeparator}
    testID="stats-routine-calendar-separator"
  />
);

export default function StatsPage() {
  const { theme } = useAppTheme();
  const user = useAuthUser();
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    getMonthStart(new Date(Date.now())),
  );
  const [viewMode, setViewMode] = React.useState<StatsViewMode>('calendar');
  const { data, isLoading } = useMonthlyRoutinesQuery(
    user?.nickname || '',
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
  );
  const routines = data?.routines ?? EMPTY_MONTHLY_ROUTINES;

  const moveMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  };

  const toggleViewMode = () => {
    setViewMode((mode) => (mode === 'calendar' ? 'summary' : 'calendar'));
  };

  const renderRoutineCalendar = React.useCallback<
    ListRenderItem<RoutineMonthlySummary>
  >(
    ({ item }) => (
      <RoutineStatsCalendar
        routineName={item.routineName}
        routineColor={item.symbolColor ?? DEFAULT_ROUTINE_COLOR}
        monthDate={currentMonth}
        performedDates={getPerformedDates(item)}
      />
    ),
    [currentMonth],
  );

  const renderMonthHeader = () => (
    <ThemeView
      transparent
      style={styles.monthHeader}
      testID="stats-month-header"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이전 달"
        onPress={() => moveMonth(-1)}
        style={styles.monthButton}
      >
        <StatsMonthChevronIcon
          testID="stats-month-chevron-left-icon"
          direction="left"
          color={palette.theme.gray[45]}
        />
      </Pressable>
      <Typography
        variant="body2"
        weight="semibold"
        color={theme.colors.text.gray}
      >
        {formatMonthLabel(currentMonth)}
      </Typography>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 달"
        onPress={() => moveMonth(1)}
        style={styles.monthButton}
      >
        <StatsMonthChevronIcon
          testID="stats-month-chevron-right-icon"
          direction="right"
          color={palette.theme.gray[45]}
        />
      </Pressable>
    </ThemeView>
  );

  if (!user) {
    return null;
  }

  const isSummaryMode = viewMode === 'summary';
  const nextModeLabel = isSummaryMode ? '캘린더 보기' : '통계 보기';

  return (
    <Container noPadding>
      <PageHeader
        title="통계"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={nextModeLabel}
            onPress={toggleViewMode}
            style={styles.viewModeButton}
            testID="stats-view-mode-toggle"
          >
            <Ionicons
              name={isSummaryMode ? 'calendar-outline' : 'stats-chart-outline'}
              size={baseFoundation.iconSize.m}
              color={palette.theme.gray[700]}
            />
          </Pressable>
        }
      />
      {isSummaryMode ? (
        <ScrollView
          testID="stats-summary-scroll"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderMonthHeader()}
          <RoutineStatsSummary monthDate={currentMonth} routines={routines} />
        </ScrollView>
      ) : isLoading ? (
        <ThemeView transparent style={styles.content}>
          {renderMonthHeader()}
          <ThemeView transparent style={styles.stateContainer}>
            <Loading />
          </ThemeView>
        </ThemeView>
      ) : routines.length ? (
        <FlashList
          testID="stats-routine-list"
          data={routines}
          renderItem={renderRoutineCalendar}
          keyExtractor={(routine) => routine.routineId.toString()}
          ListHeaderComponent={renderMonthHeader}
          ItemSeparatorComponent={renderRoutineCalendarSeparator}
          contentContainerStyle={styles.content}
          estimatedItemSize={ROUTINE_STATS_CALENDAR_ESTIMATED_SIZE}
          getItemLayout={getRoutineCalendarItemLayout}
          removeClippedSubviews
          maxToRenderPerBatch={4}
          windowSize={5}
        />
      ) : (
        <ThemeView transparent style={styles.content}>
          {renderMonthHeader()}
          <EmptyState transparent message="등록된 루틴이 없습니다." />
        </ThemeView>
      )}
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: 0,
    paddingBottom: theme.foundation.spacing[10],
  },
  monthHeader: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[5],
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: MONTH_HEADER_VERTICAL_PADDING,
    marginBottom: theme.foundation.spacing[3],
  },
  monthButton: {
    width: baseFoundation.dimension.x32,
    height: baseFoundation.dimension.x32,
    borderRadius: theme.foundation.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeButton: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: theme.foundation.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    ...baseFoundation.shadow.s,
  },
  stateContainer: {
    minHeight: baseFoundation.dimension.x180,
  },
  routineCalendarSeparator: {
    height: ROUTINE_STATS_CALENDAR_SEPARATOR_HEIGHT,
  },
}));
