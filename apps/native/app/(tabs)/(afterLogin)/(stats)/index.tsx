import { useAllRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import type { Routine } from '@repo/types';
import React from 'react';
import { Pressable, View } from 'react-native';

import StatsMonthChevronIcon from '@/components/icons/stats-month-chevron-icon';
import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import RoutineStatsCalendar from '@/components/stat/routine-stats-calendar';
import EmptyState from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation, palette } from '@/theme/tokens';

const SHORT_DATE_LENGTH = 6;
const FULL_COMPACT_DATE_LENGTH = 8;
const YEAR_PREFIX = '20';
const ROUTINE_STATS_CALENDAR_ESTIMATED_SIZE = 300;
const ROUTINE_STATS_CALENDAR_SEPARATOR_HEIGHT = 28;
const ROUTINE_STATS_CALENDAR_ITEM_INTERVAL =
  ROUTINE_STATS_CALENDAR_ESTIMATED_SIZE +
  ROUTINE_STATS_CALENDAR_SEPARATOR_HEIGHT;
const MONTH_HEADER_VERTICAL_PADDING = 10;

const getMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const formatMonthLabel = (date: Date) => {
  return `${date.getMonth() + 1}월`;
};

const normalizeSuccessDate = (dateKey: string) => {
  if (dateKey.includes('-')) {
    return dateKey;
  }

  if (dateKey.length === SHORT_DATE_LENGTH) {
    return `${YEAR_PREFIX}${dateKey.slice(0, 2)}-${dateKey.slice(
      2,
      4,
    )}-${dateKey.slice(4, 6)}`;
  }

  if (dateKey.length === FULL_COMPACT_DATE_LENGTH) {
    return `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(
      6,
      8,
    )}`;
  }

  return dateKey;
};

const getPerformedDates = (routine: Routine) => {
  return routine.successDate.map(normalizeSuccessDate);
};

const getRoutineCalendarItemLayout = (_: Routine[] | null, index: number) => ({
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
  const user = useAuthUser();
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    getMonthStart(new Date(Date.now())),
  );
  const { data: routines = [], isLoading } = useAllRoutinesQuery(
    user?.nickname || '',
  );
  const visibleRoutines = React.useMemo(
    () => routines.filter((routine) => !routine.hidden),
    [routines],
  );

  const moveMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  };

  const renderRoutineCalendar = React.useCallback<ListRenderItem<Routine>>(
    ({ item }) => (
      <RoutineStatsCalendar
        routineName={item.routineName}
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
        color={palette.theme.gray[90]}
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

  return (
    <Container noPadding>
      <PageHeader title="통계" />
      {isLoading ? (
        <ThemeView transparent style={styles.content}>
          {renderMonthHeader()}
          <ThemeView transparent style={styles.stateContainer}>
            <Loading />
          </ThemeView>
        </ThemeView>
      ) : visibleRoutines.length ? (
        <FlashList
          testID="stats-routine-list"
          data={visibleRoutines}
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
  stateContainer: {
    minHeight: baseFoundation.dimension.x180,
  },
  routineCalendarSeparator: {
    height: ROUTINE_STATS_CALENDAR_SEPARATOR_HEIGHT,
  },
}));
