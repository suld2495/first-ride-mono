import type { Routine } from '@repo/types';

const DEFAULT_MAX_ITEMS = 3;
const SHORT_YEAR_OFFSET = 2000;
const PAD_LENGTH = 2;

export interface RoutineWidgetItem {
  id: number;
  title: string;
  weeklyCount: number;
  routineCount: number;
  achievementRate: number;
  isTodayDone: boolean;
}

export type RoutineWidgetSnapshot =
  | {
      status: 'signedOut';
      title: string;
      message: string;
      items: [];
      remainingCount: 0;
    }
  | {
      status: 'ready';
      title: string;
      message: string;
      items: RoutineWidgetItem[];
      remainingCount: number;
      generatedAt: string;
    };

interface CreateRoutineWidgetSnapshotOptions {
  maxItems?: number;
  today?: Date;
}

const createRoutineDateKey = (date: Date): string => {
  const year = date.getFullYear() - SHORT_YEAR_OFFSET;
  const month = (date.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
  const day = date.getDate();

  return `${year}${month}${day}`;
};

const getAchievementRate = (routine: Routine): number => {
  if (routine.routineCount <= 0) {
    return 1;
  }

  return routine.weeklyCount / routine.routineCount;
};

export const createSignedOutRoutineWidgetSnapshot =
  (): RoutineWidgetSnapshot => ({
    status: 'signedOut',
    title: '이번 주 루틴',
    message: '로그인 해주세요',
    items: [],
    remainingCount: 0,
  });

export const createRoutineWidgetSnapshot = (
  routines: Routine[],
  options: CreateRoutineWidgetSnapshotOptions = {},
): RoutineWidgetSnapshot => {
  const today = options.today ?? new Date();
  const todayKey = createRoutineDateKey(today);
  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;

  const widgetItems = routines
    .filter((routine) => !routine.paused && !routine.hidden)
    .map<RoutineWidgetItem>((routine) => ({
      id: routine.routineId,
      title: routine.routineName,
      weeklyCount: routine.weeklyCount,
      routineCount: routine.routineCount,
      achievementRate: getAchievementRate(routine),
      isTodayDone: routine.successDate.includes(todayKey),
    }))
    .filter((item) => item.weeklyCount < item.routineCount || item.isTodayDone)
    .sort((left, right) => {
      if (left.isTodayDone !== right.isTodayDone) {
        return left.isTodayDone ? 1 : -1;
      }

      if (left.achievementRate !== right.achievementRate) {
        return left.achievementRate - right.achievementRate;
      }

      return left.id - right.id;
    });

  return {
    status: 'ready',
    title: '이번 주 루틴',
    message: widgetItems.length ? '' : '이번 주 루틴을 모두 달성했어요',
    items: widgetItems.slice(0, maxItems),
    remainingCount: Math.max(widgetItems.length - maxItems, 0),
    generatedAt: today.toISOString(),
  };
};
