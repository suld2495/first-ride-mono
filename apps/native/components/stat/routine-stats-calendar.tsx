import React from 'react';
import { View } from 'react-native';

import {
  StyleSheet,
  type AppThemes,
  useAppTheme,
} from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

export interface RoutineStatsCalendarProps {
  routineName: string;
  monthDate: Date;
  performedDates: readonly string[];
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;
const DAYS_IN_WEEK = 7;
const PERFORMED_DATE_TEXT_COLOR = '#FFFFFF';
const ROUTINE_TITLE_VERTICAL_PADDING = 7;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getMonthCells = (month: Date) => {
  const start = getMonthStart(month);
  const firstWeekdayIndex = (start.getDay() + 6) % DAYS_IN_WEEK;
  const lastDate = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
  ).getDate();
  const totalCellCount =
    Math.ceil((firstWeekdayIndex + lastDate) / DAYS_IN_WEEK) * DAYS_IN_WEEK;

  return Array.from({ length: totalCellCount }, (_, index) => {
    const day = index - firstWeekdayIndex + 1;

    if (day < 1 || day > lastDate) {
      return null;
    }

    return new Date(start.getFullYear(), start.getMonth(), day);
  });
};

const getCalendarRows = (cells: (Date | null)[]) => {
  const rows: (Date | null)[][] = [];

  for (let index = 0; index < cells.length; index += DAYS_IN_WEEK) {
    rows.push(cells.slice(index, index + DAYS_IN_WEEK));
  }

  return rows;
};

const RoutineStatsCalendar = ({
  routineName,
  monthDate,
  performedDates,
}: RoutineStatsCalendarProps) => {
  const { theme } = useAppTheme();
  const performedDateSet = React.useMemo(
    () => new Set(performedDates),
    [performedDates],
  );
  const currentMonth = React.useMemo(
    () => getMonthStart(monthDate),
    [monthDate],
  );
  const cells = getMonthCells(currentMonth);
  const rows = getCalendarRows(cells);

  return (
    <ThemeView
      transparent
      style={styles.container}
      testID="routine-stats-calendar"
    >
      <Typography
        variant="body1"
        weight="bold"
        color={palette.theme.gray[700]}
        style={styles.routineTitle}
      >
        {routineName}
      </Typography>

      <ThemeView
        transparent
        style={styles.calendar}
        testID="routine-stats-calendar-body"
      >
        <ThemeView
          transparent
          style={styles.weekHeader}
          testID="routine-stats-calendar-week-header"
        >
          {WEEKDAY_LABELS.map((label) => (
            <View
              key={label}
              style={styles.weekCell}
              testID={`routine-stats-calendar-week-cell-${label}`}
            >
              <Typography
                variant="caption2"
                weight="medium"
                color={palette.theme.gray[500]}
              >
                {label}
              </Typography>
            </View>
          ))}
        </ThemeView>

        <ThemeView
          transparent
          style={styles.grid}
          testID="routine-stats-calendar-grid"
        >
          {rows.map((row, rowIndex) => (
            <ThemeView
              key={`week-${rowIndex}`}
              transparent
              style={styles.weekRow}
              testID={`routine-stats-calendar-week-row-${rowIndex}`}
            >
              {row.map((date, index) => {
                if (!date) {
                  return (
                    <View
                      key={`empty-${rowIndex}-${index}`}
                      style={styles.dayCell}
                    />
                  );
                }

                const dateKey = formatDateKey(date);
                const isPerformed = performedDateSet.has(dateKey);

                return (
                  <View
                    key={dateKey}
                    accessibilityLabel={`${dateKey} ${
                      isPerformed ? '수행 완료' : '미수행'
                    }`}
                    accessibilityState={{ selected: isPerformed }}
                    accessible
                    style={styles.dayCell}
                    testID={`routine-stats-calendar-day-cell-${dateKey}`}
                  >
                    <View
                      testID={`routine-stats-calendar-day-marker-${dateKey}`}
                      style={[
                        styles.dayMarker,
                        isPerformed && styles.dayMarkerPerformed,
                      ]}
                    >
                      <Typography
                        variant="body1"
                        weight="bold"
                        color={
                          isPerformed
                            ? PERFORMED_DATE_TEXT_COLOR
                            : theme.colors.text.tertiary
                        }
                      >
                        {date.getDate()}
                      </Typography>
                    </View>
                  </View>
                );
              })}
            </ThemeView>
          ))}
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default RoutineStatsCalendar;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  container: {
    gap: theme.foundation.spacing[2],
  },
  routineTitle: {
    paddingVertical: ROUTINE_TITLE_VERTICAL_PADDING,
  },
  calendar: {
    gap: theme.foundation.spacing[5],
    paddingHorizontal: theme.foundation.spacing[3],
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCell: {
    width: baseFoundation.dimension.x36,
    alignItems: 'center',
  },
  grid: {
    rowGap: theme.foundation.spacing[1],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayMarker: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.dimension.x18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayMarkerPerformed: {
    backgroundColor: theme.colors.action.primary.default,
  },
}));
