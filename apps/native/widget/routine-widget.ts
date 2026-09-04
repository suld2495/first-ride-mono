import type {
  Routine,
  StatResponse,
  User,
  WidgetRoutineData,
} from '@repo/types';

import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { appThemes, type ThemeName } from '@/theme/themes';

const PAD_LENGTH = 2;
const SMALL_WIDGET_ROUTINE_LIMIT = 4;
const DEFAULT_THEME_NAME: ThemeName = 'dark';
const DEFAULT_ASSET_HOST = (
  process.env.EXPO_PUBLIC_VITE_BASE_URL ?? ''
).replace(/\/$/, '');

export interface RoutineWidgetItem {
  id: number;
  title: string;
  weeklyCount: number;
  routineCount: number;
  achievementRate: number;
  completedDates: string[];
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

export interface CharacterWidgetLevelBadgeStyle {
  backgroundColor: string;
  textColor: string;
}

export interface CharacterWidgetExperienceStyle {
  primaryColor: string;
  trackColor: string;
  textColor: string;
}

export interface CharacterWidgetSnapshot {
  status: 'ready';
  level: number;
  currentExp: number;
  expForNextLevel: number;
  characterImageUrl: null | string;
  backgroundImageUrl: null | string;
  generatedAt: string;
  levelBadgeStyle: CharacterWidgetLevelBadgeStyle;
  experienceStyle: CharacterWidgetExperienceStyle;
}

export interface WidgetSyncRoutineData {
  routineId: number;
  routineName: string;
  routineCount: number;
  completedCount: number;
  widgetEnabled: boolean;
  completedDates: string[];
}

export interface WidgetSyncData {
  level: number;
  exp: number;
  expForNextLevel: number;
  characterImageUrl: null | string;
  backgroundImageUrl: null | string;
  routines: WidgetSyncRoutineData[];
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
      mediumItems?: RoutineWidgetItem[];
      largeItems?: RoutineWidgetItem[];
      remainingCount: 0;
      generatedAt: string;
      countLabelStyle: RoutineWidgetCountLabelStyle;
    };

interface CreateRoutineWidgetSnapshotOptions {
  today?: Date;
  themeName?: ThemeName;
}

interface CreateCharacterWidgetSnapshotOptions {
  assetHost?: string;
  now?: Date;
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

const WIDGET_ROUTINE_ACCENT_COLORS = [
  '#8FAFF0',
  '#FFD17A',
  '#F28C8C',
  '#99D68F',
  '#C7A6FF',
  '#7DD9D3',
] as const;

const createRoutineDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
  const day = date.getDate().toString().padStart(PAD_LENGTH, '0');

  return `${year}-${month}-${day}`;
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
): RoutineWidgetItem[] => items.slice(0, SMALL_WIDGET_ROUTINE_LIMIT);

const createWidgetRoutineItems = (
  widgetData: WidgetRoutineData,
  todayKey: string,
): RoutineWidgetItem[] => {
  return widgetData.routines.map((routine, index) => {
    const completedDates = [...new Set(routine.completedDates)];
    const completedCount = Math.max(0, Math.floor(routine.completedCount));
    const routineCount = Math.max(0, Math.floor(routine.routineCount));
    const accentColor =
      WIDGET_ROUTINE_ACCENT_COLORS[index % WIDGET_ROUTINE_ACCENT_COLORS.length];

    return {
      id: routine.routineId,
      title: routine.routineName,
      weeklyCount: completedCount,
      routineCount,
      achievementRate: routineCount <= 0 ? 1 : completedCount / routineCount,
      completedDates,
      isTodayDone: completedDates.includes(todayKey),
      accentColor,
      darkAccentColor: accentColor,
    };
  });
};

const resolveWidgetAssetUrl = (
  value: null | string | undefined,
  assetHost: string,
): null | string => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  if (/^https?:\/\//.test(normalizedValue)) {
    return normalizedValue;
  }

  const normalizedHost = assetHost.replace(/\/$/, '');

  if (!normalizedHost || !normalizedValue.startsWith('/')) {
    return null;
  }

  return `${normalizedHost}${normalizedValue}`;
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
    .map<RoutineWidgetItem>((routine) => {
      const completedDates = routine.confirmations
        .filter((confirmation) => confirmation.status === 'PASS')
        .map((confirmation) => confirmation.date);
      const completedDateSet = new Set(completedDates);
      const accentColor = routine.symbolColor ?? DEFAULT_ROUTINE_COLOR;

      return {
        id: routine.routineId,
        title: routine.routineName,
        weeklyCount: routine.weeklyCount,
        routineCount: routine.routineCount,
        achievementRate: getAchievementRate(routine),
        completedDates,
        isTodayDone: completedDateSet.has(todayKey),
        accentColor,
        darkAccentColor: accentColor,
      };
    })
    .filter((item) => item.weeklyCount < item.routineCount || item.isTodayDone);

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

export const createRoutineWidgetSnapshotFromWidgetData = (
  widgetData: WidgetSyncData,
  options: CreateRoutineWidgetSnapshotOptions = {},
): RoutineWidgetSnapshot => {
  const today = options.today ?? new Date();
  const todayKey = createRoutineDateKey(today);

  const widgetItems = widgetData.routines
    .filter((routine) => routine.widgetEnabled)
    .map<RoutineWidgetItem>((routine) => {
      const completedDates = [...new Set(routine.completedDates)];

      return {
        id: routine.routineId,
        title: routine.routineName,
        weeklyCount: routine.completedCount,
        routineCount: routine.routineCount,
        achievementRate:
          routine.routineCount <= 0
            ? 1
            : routine.completedCount / routine.routineCount,
        completedDates,
        isTodayDone: completedDates.includes(todayKey),
        accentColor: DEFAULT_ROUTINE_COLOR,
        darkAccentColor: DEFAULT_ROUTINE_COLOR,
      };
    })
    .filter((item) => item.weeklyCount < item.routineCount || item.isTodayDone);

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

export const createRoutineWidgetSnapshotFromWidgetResponses = (
  widgetDataBySize: Record<'SMALL' | 'MEDIUM' | 'LARGE', WidgetRoutineData>,
  options: CreateRoutineWidgetSnapshotOptions = {},
): RoutineWidgetSnapshot => {
  const today = options.today ?? new Date();
  const todayKey = createRoutineDateKey(today);
  const smallItems = createWidgetRoutineItems(widgetDataBySize.SMALL, todayKey);
  const mediumItems = createWidgetRoutineItems(
    widgetDataBySize.MEDIUM,
    todayKey,
  );
  const largeItems = createWidgetRoutineItems(widgetDataBySize.LARGE, todayKey);

  return {
    status: 'ready',
    title: '이번 주 루틴',
    message:
      smallItems.length || mediumItems.length || largeItems.length
        ? ''
        : '표시할 루틴이 없습니다',
    items: largeItems,
    smallItems: createSmallRoutineWidgetItems(smallItems),
    mediumItems,
    largeItems,
    remainingCount: 0,
    generatedAt: today.toISOString(),
    countLabelStyle: createRoutineWidgetCountLabelStyle(options.themeName),
  };
};

export const createCharacterWidgetSnapshot = (
  user: User,
  stats: StatResponse,
  options: CreateCharacterWidgetSnapshotOptions = {},
): CharacterWidgetSnapshot => {
  const themeName = options.themeName ?? DEFAULT_THEME_NAME;
  const theme = appThemes[themeName] ?? appThemes.dark;
  const expForNextLevel = Math.max(1, Math.floor(stats.expForNextLevel));
  const currentExp = Math.min(
    expForNextLevel,
    Math.max(0, Math.floor(stats.currentLevelProgress)),
  );
  const assetHost = options.assetHost ?? DEFAULT_ASSET_HOST;
  const usesDarkTheme = theme.name === 'dark';
  const experienceTheme = appThemes[getThemeNameFromUserJob(user)];

  return {
    status: 'ready',
    level: Math.max(1, Math.floor(stats.currentLevel)),
    currentExp,
    expForNextLevel,
    characterImageUrl: resolveWidgetAssetUrl(user.characterImageUrl, assetHost),
    backgroundImageUrl: resolveWidgetAssetUrl(
      user.backgroundImageUrl,
      assetHost,
    ),
    generatedAt: (options.now ?? new Date()).toISOString(),
    levelBadgeStyle: {
      backgroundColor: usesDarkTheme
        ? theme.colors.brand.background
        : theme.colors.brand.text,
      textColor: usesDarkTheme
        ? theme.colors.brand.text
        : theme.colors.brand.background,
    },
    experienceStyle: {
      primaryColor: experienceTheme.colors.brand.icon,
      trackColor: experienceTheme.colors.brand.secondary,
      textColor: experienceTheme.colors.brand.routineBorder,
    },
  };
};

export const createCharacterWidgetSnapshotFromWidgetData = (
  widgetData: WidgetSyncData,
  options: CreateCharacterWidgetSnapshotOptions = {},
): CharacterWidgetSnapshot => {
  const themeName = options.themeName ?? DEFAULT_THEME_NAME;
  const theme = appThemes[themeName] ?? appThemes.dark;
  const expForNextLevel = Math.max(1, Math.floor(widgetData.expForNextLevel));
  const currentExp = Math.min(
    expForNextLevel,
    Math.max(0, Math.floor(widgetData.exp)),
  );
  const assetHost = options.assetHost ?? DEFAULT_ASSET_HOST;
  const usesDarkTheme = theme.name === 'dark';

  return {
    status: 'ready',
    level: Math.max(1, Math.floor(widgetData.level)),
    currentExp,
    expForNextLevel,
    characterImageUrl: resolveWidgetAssetUrl(
      widgetData.characterImageUrl,
      assetHost,
    ),
    backgroundImageUrl: resolveWidgetAssetUrl(
      widgetData.backgroundImageUrl,
      assetHost,
    ),
    generatedAt: (options.now ?? new Date()).toISOString(),
    levelBadgeStyle: {
      backgroundColor: usesDarkTheme
        ? theme.colors.brand.background
        : theme.colors.brand.text,
      textColor: usesDarkTheme
        ? theme.colors.brand.text
        : theme.colors.brand.background,
    },
    experienceStyle: {
      primaryColor: theme.colors.brand.icon,
      trackColor: theme.colors.brand.secondary,
      textColor: theme.colors.brand.routineBorder,
    },
  };
};
