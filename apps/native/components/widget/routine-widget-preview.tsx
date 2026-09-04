import type { WidgetRoutineSize } from '@repo/types';
import { getFormatDate, getWeekMonday, getToday } from '@repo/shared/utils';
import { View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';

const DAYS_PER_WEEK = 7;
export const SMALL_WIDGET_ROUTINE_LIMIT = 4;
const MEDIUM_VISIBLE_ITEM_COUNT = 4;
const LARGE_VISIBLE_ITEM_COUNT = 10;
const NATIVE_SMALL_WIDGET_PADDING = 20;
const NATIVE_WIDGET_HORIZONTAL_PADDING = 24;
const NATIVE_WIDGET_VERTICAL_PADDING = 16;
const NATIVE_WEEKLY_NAME_COLUMN_WIDTH = 150;
const NATIVE_WEEKLY_ROW_HEIGHT = 22;
const NATIVE_WEEKLY_MEDIUM_ROW_SPACING = 4;
const NATIVE_WEEKLY_LARGE_ROW_SPACING = 8;
const WIDGET_SHADOW_OPACITY = 0.18;
const WIDGET_SHADOW_RADIUS = 8;
const WIDGET_SHADOW_OFFSET_Y = 5;
const WIDGET_SHADOW_ELEVATION = 5;
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const WIDGET_ROUTINE_ACCENT_COLORS = [
  '#8FAFF0',
  '#FFD17A',
  '#F28C8C',
  '#99D68F',
  '#C7A6FF',
  '#7DD9D3',
] as const;

export interface RoutineWidgetPreviewRoutine {
  accentColor: string;
  completedDates: string[];
  id: number;
  routineCount: number;
  title: string;
  weeklyCount: number;
}

interface RoutineWidgetPreviewProps {
  routines: RoutineWidgetPreviewRoutine[];
  size: WidgetRoutineSize;
  weekStartDate?: string;
}

export const getRoutineWidgetAccentColor = (index: number): string =>
  WIDGET_ROUTINE_ACCENT_COLORS[index % WIDGET_ROUTINE_ACCENT_COLORS.length];

const getWeekDateKeys = (weekStartDate?: string): string[] => {
  const monday = weekStartDate
    ? new Date(`${weekStartDate}T00:00:00`)
    : new Date(`${getWeekMonday(new Date())}T00:00:00`);

  if (Number.isNaN(monday.getTime())) {
    return [];
  }

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return getFormatDate(date);
  });
};

const RoutineWidgetSmallPreview = ({
  routines,
}: Pick<RoutineWidgetPreviewProps, 'routines'>) => {
  const { theme } = useAppTheme();
  const today = getToday();
  const visibleRoutines = routines.slice(0, SMALL_WIDGET_ROUTINE_LIMIT);

  return (
    <View style={styles.smallContent}>
      <Typography
        color={theme.colors.field.text}
        numberOfLines={1}
        style={styles.smallTitle}
        weight="bold"
      >
        이번 주 루틴
      </Typography>
      {visibleRoutines.length ? (
        <View style={styles.smallRoutineList}>
          {visibleRoutines.map((routine) => {
            const isTodayDone = routine.completedDates.includes(today);

            return (
              <View key={routine.id} style={styles.smallRoutineRow}>
                <View
                  style={[
                    styles.countLabel,
                    {
                      backgroundColor: theme.colors.brand.todaySuccessCheckbox,
                    },
                  ]}
                >
                  <Typography
                    color={theme.colors.brand.todaySuccessCheck}
                    style={styles.countText}
                    weight="bold"
                  >
                    {routine.weeklyCount}/{routine.routineCount}
                  </Typography>
                </View>
                <Typography
                  color={
                    isTodayDone
                      ? theme.colors.text.tertiary
                      : theme.colors.field.text
                  }
                  numberOfLines={1}
                  style={[
                    styles.smallRoutineTitle,
                    {
                      textDecorationLine: isTodayDone ? 'line-through' : 'none',
                    },
                  ]}
                  weight="medium"
                >
                  {routine.title}
                </Typography>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyPreview}>
          <Typography color="secondary" variant="caption1">
            표시할 루틴이 없습니다
          </Typography>
        </View>
      )}
    </View>
  );
};

const RoutineWidgetWeeklyPreview = ({
  routines,
  size,
  weekStartDate,
}: RoutineWidgetPreviewProps) => {
  const { theme } = useAppTheme();
  const weekDateKeys = getWeekDateKeys(weekStartDate);
  const visibleLimit =
    size === 'LARGE' ? LARGE_VISIBLE_ITEM_COUNT : MEDIUM_VISIBLE_ITEM_COUNT;
  const visibleRoutines = routines.slice(0, visibleLimit);
  const today = getToday();

  return (
    <View
      style={[
        styles.weeklyContent,
        {
          gap:
            size === 'LARGE'
              ? NATIVE_WEEKLY_LARGE_ROW_SPACING
              : NATIVE_WEEKLY_MEDIUM_ROW_SPACING,
        },
      ]}
    >
      <View style={styles.weeklyRow}>
        <View style={styles.routineNameColumn} />
        {DAY_LABELS.map((label, index) => {
          const isToday = weekDateKeys[index] === today;

          return (
            <View
              key={label}
              style={[
                styles.dayLabelCell,
                isToday && {
                  backgroundColor:
                    theme.name === 'light'
                      ? theme.colors.action.primary.default
                      : theme.colors.background.sunken,
                },
              ]}
            >
              <Typography
                color={
                  isToday
                    ? theme.colors.action.primary.label
                    : theme.colors.text.secondary
                }
                style={styles.dayLabel}
                weight={isToday ? 'bold' : 'semibold'}
              >
                {label}
              </Typography>
            </View>
          );
        })}
      </View>
      {visibleRoutines.length ? (
        visibleRoutines.map((routine, routineIndex) => (
          <View key={routine.id} style={styles.weeklyRow}>
            <Typography
              color={theme.colors.field.text}
              numberOfLines={1}
              style={styles.routineName}
              weight="semibold"
            >
              {routine.title}
            </Typography>
            {weekDateKeys.map((dateKey) => {
              const isCompleted = routine.completedDates.includes(dateKey);

              return (
                <View key={dateKey} style={styles.dayCell}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isCompleted
                          ? routine.accentColor ||
                            getRoutineWidgetAccentColor(routineIndex)
                          : theme.colors.border.divider,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        ))
      ) : (
        <View style={styles.emptyWeeklyPreview}>
          <Typography color="secondary" variant="caption1">
            표시할 루틴이 없습니다
          </Typography>
        </View>
      )}
    </View>
  );
};

export default function RoutineWidgetPreview({
  routines,
  size,
  weekStartDate,
}: RoutineWidgetPreviewProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={`${size === 'SMALL' ? '소형' : size === 'MEDIUM' ? '중형' : '대형'} 위젯 미리보기`}
      style={[
        styles.widget,
        size === 'SMALL' ? styles.smallWidget : styles.weeklyWidget,
        size === 'LARGE' && styles.largeWidget,
        {
          backgroundColor: theme.colors.field.background,
        },
      ]}
    >
      {size === 'SMALL' ? (
        <RoutineWidgetSmallPreview routines={routines} />
      ) : (
        <RoutineWidgetWeeklyPreview
          routines={routines}
          size={size}
          weekStartDate={weekStartDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  widget: {
    borderRadius: theme.foundation.radii.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: WIDGET_SHADOW_OFFSET_Y },
    shadowOpacity: WIDGET_SHADOW_OPACITY,
    shadowRadius: WIDGET_SHADOW_RADIUS,
    elevation: WIDGET_SHADOW_ELEVATION,
  },
  smallWidget: {
    width: 196,
    height: 184,
    alignSelf: 'center',
  },
  weeklyWidget: {
    width: '100%',
    minHeight: 166,
  },
  largeWidget: {
    minHeight: 270,
  },
  smallContent: {
    flex: 1,
    padding: NATIVE_SMALL_WIDGET_PADDING,
  },
  smallTitle: {
    fontSize: 15,
    lineHeight: 18,
    height: 18,
  },
  smallRoutineList: {
    marginTop: 6,
    gap: 6,
  },
  smallRoutineRow: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countLabel: {
    width: 36,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  countText: {
    fontSize: 9,
    lineHeight: 18,
    textAlign: 'center',
  },
  smallRoutineTitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyContent: {
    flex: 1,
    paddingHorizontal: NATIVE_WIDGET_HORIZONTAL_PADDING,
    paddingVertical: NATIVE_WIDGET_VERTICAL_PADDING,
  },
  weeklyRow: {
    minHeight: NATIVE_WEEKLY_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineNameColumn: {
    width: NATIVE_WEEKLY_NAME_COLUMN_WIDTH,
    flexShrink: 0,
  },
  routineName: {
    width: NATIVE_WEEKLY_NAME_COLUMN_WIDTH,
    flexShrink: 0,
    minWidth: 0,
    fontSize: 13,
    lineHeight: NATIVE_WEEKLY_ROW_HEIGHT,
  },
  dayLabelCell: {
    flex: 1,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  dayLabel: {
    fontSize: 11,
    lineHeight: 16,
  },
  dayCell: {
    flex: 1,
    minHeight: NATIVE_WEEKLY_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyWeeklyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.foundation.spacing[5],
  },
}));
