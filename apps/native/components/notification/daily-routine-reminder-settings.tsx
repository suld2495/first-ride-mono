import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

const MIN_REMINDER_MINUTES = 8 * 60;
const MAX_REMINDER_MINUTES = 22 * 60;
const MIN_REMINDER_INTERVAL_MINUTES = 2 * 60;
const MAX_REMINDER_TIMES = 3;
const KOREA_TIME_ZONE = 'Asia/Seoul';

type DailyRoutineReminderSettingsProps = {
  onChange: (times: string[]) => void;
  times: string[];
};

const parseReminderTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatReminderTime = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: KOREA_TIME_ZONE,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';

  return `${hour}:${minute}:00`;
};

const formatReminderTimeForDisplay = (time: string): string => time.slice(0, 5);

const createDateForReminderTime = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(Date.UTC(2000, 0, 1, hours - 9, minutes));
};

const sortReminderTimes = (times: string[]): string[] =>
  [...times].sort(
    (left, right) => parseReminderTime(left) - parseReminderTime(right),
  );

const isValidReminderTimeSet = (times: string[]): boolean => {
  const minutes = times.map(parseReminderTime);

  return (
    minutes.every(
      (time) => time >= MIN_REMINDER_MINUTES && time < MAX_REMINDER_MINUTES,
    ) &&
    new Set(minutes).size === minutes.length &&
    minutes.every((time, index) =>
      minutes
        .filter((_otherTime, otherIndex) => otherIndex !== index)
        .every(
          (otherTime) =>
            Math.abs(time - otherTime) >= MIN_REMINDER_INTERVAL_MINUTES,
        ),
    )
  );
};

const getNextAvailableReminderTime = (times: string[]): string | undefined => {
  if (times.length >= MAX_REMINDER_TIMES) {
    return undefined;
  }

  for (
    let minutes = MIN_REMINDER_MINUTES;
    minutes < MAX_REMINDER_MINUTES;
    minutes += 30
  ) {
    const reminderTime = `${String(Math.floor(minutes / 60)).padStart(
      2,
      '0',
    )}:${String(minutes % 60).padStart(2, '0')}:00`;

    if (isValidReminderTimeSet([...times, reminderTime])) {
      return reminderTime;
    }
  }

  return undefined;
};

export default function DailyRoutineReminderSettings({
  onChange,
  times,
}: DailyRoutineReminderSettingsProps) {
  const { theme } = useAppTheme();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const displayedTimes = times;
  const editingTime =
    editingIndex === null ? undefined : displayedTimes[editingIndex];

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed' || !date || editingIndex === null) {
      setEditingIndex(null);
      return;
    }

    const nextTime = formatReminderTime(date);
    const nextTimes = displayedTimes.map((time, index) =>
      index === editingIndex ? nextTime : time,
    );

    if (isValidReminderTimeSet(nextTimes)) {
      onChange(sortReminderTimes(nextTimes));
    }

    if (Platform.OS === 'android') {
      setEditingIndex(null);
    }
  };

  return (
    <View
      style={styles.container}
      testID="notification-settings-reminder-section"
    >
      <View style={styles.header}>
        <View style={styles.textColumn}>
          <Typography variant="body2" weight="semibold">
            오늘의 이루라 알림
          </Typography>
          <Typography color="secondary" variant="caption1">
            하루 {displayedTimes.length}회
          </Typography>
        </View>
        {displayedTimes.length < MAX_REMINDER_TIMES ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="알림 시간 추가"
            onPress={() => {
              const nextTime = getNextAvailableReminderTime(displayedTimes);
              if (nextTime) {
                onChange(sortReminderTimes([...displayedTimes, nextTime]));
              }
            }}
            style={styles.addButton}
            testID="notification-settings-reminder-add"
          >
            <Typography
              style={styles.actionLabel}
              variant="caption1"
              weight="semibold"
            >
              시간 추가
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.timeList}>
        {displayedTimes.map((time, index) => (
          <View key={time} style={styles.timeRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`발송 시간 ${index + 1}`}
              onPress={() => {
                setEditingIndex(index);
              }}
              style={styles.timeButton}
              testID={`notification-settings-reminder-time-${index}`}
            >
              <Typography variant="body2" weight="semibold">
                {formatReminderTimeForDisplay(time)}
              </Typography>
            </Pressable>
            <Pressable
              accessibilityLabel={`발송 시간 ${index + 1} 삭제`}
              accessibilityRole="button"
              onPress={() => {
                onChange(
                  displayedTimes.filter(
                    (_time, timeIndex) => timeIndex !== index,
                  ),
                );
              }}
              style={styles.removeButton}
              testID={`notification-settings-reminder-remove-${index}`}
            >
              <Typography style={styles.actionLabel} variant="caption1">
                삭제
              </Typography>
            </Pressable>
          </View>
        ))}
      </View>

      {editingTime ? (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            display="spinner"
            is24Hour
            mode="time"
            onChange={handlePickerChange}
            testID="notification-settings-reminder-time-picker"
            textColor={theme.colors.action.primary.label}
            timeZoneName="Asia/Seoul"
            value={createDateForReminderTime(editingTime)}
          />
          {Platform.OS === 'ios' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setEditingIndex(null);
              }}
              style={styles.doneButton}
              testID="notification-settings-reminder-time-done"
            >
              <Typography
                style={styles.actionLabel}
                variant="caption1"
                weight="semibold"
              >
                선택 완료
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[3],
  },
  textColumn: {
    flex: 1,
    gap: theme.foundation.spacing[1],
  },
  actionLabel: {
    color: theme.colors.action.primary.label,
  },
  addButton: {
    minHeight: baseFoundation.dimension.x32,
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[2],
  },
  timeList: {
    gap: theme.foundation.spacing[2],
    marginTop: theme.foundation.spacing[3],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[3],
  },
  timeButton: {
    minHeight: baseFoundation.dimension.x40,
    minWidth: baseFoundation.dimension.x80,
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[3],
    borderRadius: theme.foundation.radii.s,
    backgroundColor: theme.colors.background.elevated,
  },
  removeButton: {
    minHeight: baseFoundation.dimension.x40,
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[2],
  },
  pickerContainer: {
    alignItems: 'center',
    marginTop: theme.foundation.spacing[3],
    paddingTop: theme.foundation.spacing[3],
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
  },
  doneButton: {
    minHeight: baseFoundation.dimension.x40,
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[3],
  },
}));
