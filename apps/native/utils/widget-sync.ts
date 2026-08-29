import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import type { ThemeName } from '@/theme/themes';
import {
  createCharacterWidgetSnapshotFromWidgetData,
  createRoutineWidgetSnapshotFromWidgetData,
  type WidgetSyncData,
  type WidgetSyncRoutineData,
} from '@/widget/routine-widget';
import {
  saveCharacterWidgetSnapshot,
  saveRoutineWidgetSnapshot,
} from '@/widget/routine-widget-native';

export const WIDGET_SYNC_TASK = 'first-ride-widget-sync';

interface WidgetSnapshotSyncOptions {
  now?: Date;
  themeName?: ThemeName;
}

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PARSE_DEPTH = 4;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonValue = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
};

const readInteger = (value: unknown, minimum: number): number | undefined => {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < minimum
  ) {
    return undefined;
  }

  return value;
};

const readNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : undefined;
};

const readOptionalString = (value: unknown): null | string =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const readCompletedDates = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter(
        (date): date is string =>
          typeof date === 'string' && DATE_KEY_PATTERN.test(date),
      ),
    ),
  ];
};

const parseWidgetSyncRoutine = (
  value: unknown,
): WidgetSyncRoutineData | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const routineId = readInteger(value.routineId, 1);
  const routineName = readNonEmptyString(value.routineName);
  const routineCount = readInteger(value.routineCount, 0);
  const completedCount = readInteger(value.completedCount, 0);

  if (
    routineId === undefined ||
    routineName === undefined ||
    routineCount === undefined ||
    completedCount === undefined ||
    typeof value.widgetEnabled !== 'boolean'
  ) {
    return undefined;
  }

  return {
    routineId,
    routineName,
    routineCount,
    completedCount,
    widgetEnabled: value.widgetEnabled,
    completedDates: readCompletedDates(value.completedDates),
  };
};

const parseWidgetSyncData = (value: unknown): WidgetSyncData | undefined => {
  const parsedValue = parseJsonValue(value);

  if (!isRecord(parsedValue)) {
    return undefined;
  }

  const level = readInteger(parsedValue.level, 1);
  const exp = readInteger(parsedValue.exp, 0);
  const expForNextLevel = readInteger(parsedValue.expForNextLevel, 1);
  const routines = Array.isArray(parsedValue.routines)
    ? parsedValue.routines
        .map(parseWidgetSyncRoutine)
        .filter(
          (routine): routine is WidgetSyncRoutineData => routine !== undefined,
        )
    : undefined;

  if (
    level === undefined ||
    exp === undefined ||
    expForNextLevel === undefined ||
    routines === undefined
  ) {
    return undefined;
  }

  return {
    level,
    exp,
    expForNextLevel,
    characterImageUrl: readOptionalString(parsedValue.characterImageUrl),
    backgroundImageUrl: readOptionalString(parsedValue.backgroundImageUrl),
    routines,
  };
};

const findWidgetSyncData = (
  value: unknown,
  depth = 0,
): WidgetSyncData | undefined => {
  if (depth > MAX_PARSE_DEPTH) {
    return undefined;
  }

  const parsedValue = parseJsonValue(value);

  if (!isRecord(parsedValue)) {
    return undefined;
  }

  if (parsedValue.widgetSync === true) {
    return parseWidgetSyncData(parsedValue.widgetData);
  }

  for (const nestedValue of [
    parsedValue.dataString,
    parsedValue.body,
    parsedValue.data,
  ]) {
    const widgetData = findWidgetSyncData(nestedValue, depth + 1);

    if (widgetData) {
      return widgetData;
    }
  }

  return undefined;
};

export const getWidgetSyncData = (
  notificationData: unknown,
): WidgetSyncData | undefined => findWidgetSyncData(notificationData);

export const syncWidgetData = async (
  widgetData: WidgetSyncData,
  options: WidgetSnapshotSyncOptions = {},
): Promise<void> => {
  const routineSnapshot = createRoutineWidgetSnapshotFromWidgetData(
    widgetData,
    { today: options.now, themeName: options.themeName },
  );
  const characterSnapshot = createCharacterWidgetSnapshotFromWidgetData(
    widgetData,
    { now: options.now, themeName: options.themeName },
  );

  await Promise.all([
    saveRoutineWidgetSnapshot(routineSnapshot),
    saveCharacterWidgetSnapshot(characterSnapshot),
  ]);
};

export const syncWidgetDataFromNotificationData = async (
  notificationData: unknown,
  options: WidgetSnapshotSyncOptions = {},
): Promise<boolean> => {
  const widgetData = getWidgetSyncData(notificationData);

  if (!widgetData) {
    return false;
  }

  await syncWidgetData(widgetData, options);

  return true;
};

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  WIDGET_SYNC_TASK,
  async ({ data, error }) => {
    if (error) {
      return;
    }

    await syncWidgetDataFromNotificationData(data);
  },
);

export const registerWidgetSyncTask = (): void => {
  if (Platform.OS === 'web') {
    return;
  }

  void Notifications.registerTaskAsync(WIDGET_SYNC_TASK).catch(() => undefined);
};
