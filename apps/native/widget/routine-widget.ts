import type { Routine } from '@repo/types';

import { appThemes, type ThemeName } from '@/theme/themes';

const SHORT_YEAR_OFFSET = 2000;
const PAD_LENGTH = 2;
const DEFAULT_THEME_NAME: ThemeName = 'dark';

export interface RoutineWidgetItem {
  id: number;
  title: string;
  weeklyCount: number;
  routineCount: number;
  achievementRate: number;
  successDate: string[];
  isTodayDone: boolean;
  accentColor: string;
  darkAccentColor: string;
}

export interface RoutineWidgetCountLabelStyle {
  backgroundColor: string;
  textColor: string;
  darkBackgroundColor: string;
  darkTextColor: string;
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
      smallItems: RoutineWidgetItem[];
      remainingCount: 0;
      generatedAt: string;
      countLabelStyle: RoutineWidgetCountLabelStyle;
    };

interface CreateRoutineWidgetSnapshotOptions {
  today?: Date;
  themeName?: ThemeName;
}

const DARK_COUNT_LABEL_STYLES: Record<ThemeName, RoutineWidgetCountLabelStyle> =
  {
    light: {
      backgroundColor: appThemes.light.colors.brand.todaySuccessCheckbox,
      textColor: appThemes.light.colors.brand.todaySuccessCheck,
      darkBackgroundColor: '#1565C0',
      darkTextColor: '#BBDEFB',
    },
    dark: {
      backgroundColor: appThemes.dark.colors.brand.todaySuccessCheckbox,
      textColor: appThemes.dark.colors.brand.todaySuccessCheck,
      darkBackgroundColor: '#1565C0',
      darkTextColor: '#BBDEFB',
    },
    blue: {
      backgroundColor: appThemes.blue.colors.brand.todaySuccessCheckbox,
      textColor: appThemes.blue.colors.brand.todaySuccessCheck,
      darkBackgroundColor: '#2C5171',
      darkTextColor: '#A3D4FF',
    },
    green: {
      backgroundColor: appThemes.green.colors.brand.todaySuccessCheckbox,
      textColor: appThemes.green.colors.brand.todaySuccessCheck,
      darkBackgroundColor: '#416B58',
      darkTextColor: '#AFEACB',
    },
    red: {
      backgroundColor: appThemes.red.colors.brand.todaySuccessCheckbox,
      textColor: appThemes.red.colors.brand.todaySuccessCheck,
      darkBackgroundColor: '#7A486E',
      darkTextColor: '#FFBBEF',
    },
  };

const ROUTINE_STATUS_ACCENT_COLORS: Pick<
  RoutineWidgetItem,
  'accentColor' | 'darkAccentColor'
>[] = [
  { accentColor: '#8FAFEF', darkAccentColor: '#9BB8F4' },
  { accentColor: '#FFD17A', darkAccentColor: '#FFD98F' },
  { accentColor: '#F28B8B', darkAccentColor: '#FF9B9B' },
  { accentColor: '#9AD58F', darkAccentColor: '#AEE7A5' },
  { accentColor: '#C6A6FF', darkAccentColor: '#D3B8FF' },
  { accentColor: '#7CD9D3', darkAccentColor: '#8BE8E3' },
];

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

const createRoutineWidgetCountLabelStyle = (
  themeName: ThemeName = DEFAULT_THEME_NAME,
): RoutineWidgetCountLabelStyle => {
  return DARK_COUNT_LABEL_STYLES[themeName] ?? DARK_COUNT_LABEL_STYLES.dark;
};

const createSmallRoutineWidgetItems = (
  items: RoutineWidgetItem[],
): RoutineWidgetItem[] => {
  const pendingItems: RoutineWidgetItem[] = [];
  const doneTodayItems: RoutineWidgetItem[] = [];

  items.forEach((item) => {
    if (item.isTodayDone) {
      doneTodayItems.push(item);
      return;
    }

    pendingItems.push(item);
  });

  return [...pendingItems, ...doneTodayItems];
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

  const widgetItems = routines
    .map<Omit<RoutineWidgetItem, 'accentColor' | 'darkAccentColor'>>(
      (routine) => ({
        id: routine.routineId,
        title: routine.routineName,
        weeklyCount: routine.weeklyCount,
        routineCount: routine.routineCount,
        achievementRate: getAchievementRate(routine),
        successDate: routine.successDate,
        isTodayDone: routine.successDate.includes(todayKey),
      }),
    )
    .filter((item) => item.weeklyCount < item.routineCount || item.isTodayDone)
    .map((item, index) => ({
      ...item,
      ...ROUTINE_STATUS_ACCENT_COLORS[
        index % ROUTINE_STATUS_ACCENT_COLORS.length
      ],
    }));

  return {
    status: 'ready',
    title: '이번 주 루틴',
    message: widgetItems.length ? '' : '이번 주 루틴을 모두 달성했어요',
    items: widgetItems,
    smallItems: createSmallRoutineWidgetItems(widgetItems),
    remainingCount: 0,
    generatedAt: today.toISOString(),
    countLabelStyle: createRoutineWidgetCountLabelStyle(options.themeName),
  };
};
