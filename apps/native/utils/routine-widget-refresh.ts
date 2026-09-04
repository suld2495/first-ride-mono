import * as routineApi from '@repo/shared/api/routine.api';
import * as statApi from '@repo/shared/api/stat.api';
import * as userApi from '@repo/shared/api/user.api';
import * as widgetRoutineApi from '@repo/shared/api/widget-routine.api';
import { routineKeys } from '@repo/shared/types/query-keys/routine';
import { statKey } from '@repo/shared/types/query-keys/stat';
import { userKey } from '@repo/shared/types/query-keys/user';
import { widgetRoutineKeys } from '@repo/shared/types/query-keys/widget-routine';
import { getWeekMonday } from '@repo/shared/utils';
import type { User, WidgetRoutineData, WidgetRoutineSize } from '@repo/types';
import type { QueryClient } from '@tanstack/react-query';

import { syncRoutineShareTargets } from '@/share/routine-share';
import type { ThemeName } from '@/theme/themes';
import {
  createCharacterWidgetSnapshot,
  createRoutineWidgetSnapshotFromWidgetResponses,
} from '@/widget/routine-widget';
import {
  saveCharacterWidgetSnapshot,
  saveRoutineWidgetSnapshot,
} from '@/widget/routine-widget-native';

interface RefreshRoutineWidgetSnapshotParams {
  nickname: string;
  themeName?: ThemeName;
  date?: string;
  queryClient?: QueryClient;
}

interface RefreshCharacterWidgetSnapshotParams {
  userId: User['userId'];
  themeName?: ThemeName;
  queryClient?: QueryClient;
}

const WIDGET_ROUTINE_SIZES: WidgetRoutineSize[] = ['SMALL', 'MEDIUM', 'LARGE'];

interface WidgetRoutineDataBySize {
  LARGE: WidgetRoutineData;
  MEDIUM: WidgetRoutineData;
  SMALL: WidgetRoutineData;
}

const fetchWidgetRoutineData = async (
  size: WidgetRoutineSize,
  queryClient?: QueryClient,
): Promise<WidgetRoutineData> => {
  if (!queryClient) {
    return widgetRoutineApi.fetchWidgetRoutineData(size);
  }

  return queryClient.fetchQuery({
    queryKey: widgetRoutineKeys.data(size),
    queryFn: () => widgetRoutineApi.fetchWidgetRoutineData(size),
    staleTime: 0,
  });
};

export const refreshRoutineWidgetSnapshots = async ({
  themeName,
  queryClient,
}: Pick<
  RefreshRoutineWidgetSnapshotParams,
  'queryClient' | 'themeName'
>): Promise<void> => {
  const [small, medium, large] = await Promise.all(
    WIDGET_ROUTINE_SIZES.map((size) =>
      fetchWidgetRoutineData(size, queryClient),
    ),
  );
  const widgetDataBySize: WidgetRoutineDataBySize = {
    SMALL: small,
    MEDIUM: medium,
    LARGE: large,
  };

  await saveRoutineWidgetSnapshot(
    createRoutineWidgetSnapshotFromWidgetResponses(widgetDataBySize, {
      themeName,
    }),
  );
};

export const refreshRoutineWidgetSnapshot = async ({
  nickname,
  themeName,
  date = getWeekMonday(new Date()),
  queryClient,
}: RefreshRoutineWidgetSnapshotParams): Promise<void> => {
  if (!nickname) {
    return;
  }

  const [routines] = await Promise.all([
    queryClient
      ? queryClient.fetchQuery({
          queryKey: routineKeys.listByDate(nickname, date),
          queryFn: () => routineApi.fetchRoutines(date),
        })
      : routineApi.fetchRoutines(date),
    refreshRoutineWidgetSnapshots({ themeName, queryClient }),
  ]);

  await syncRoutineShareTargets(routines);
};

export const refreshCharacterWidgetSnapshot = async ({
  userId,
  themeName,
  queryClient,
}: RefreshCharacterWidgetSnapshotParams): Promise<void> => {
  if (!userId) {
    return;
  }

  const [user, stats] = await Promise.all([
    queryClient
      ? queryClient.fetchQuery({
          queryKey: userKey.me(userId),
          queryFn: userApi.fetchMe,
        })
      : userApi.fetchMe(),
    queryClient
      ? queryClient.fetchQuery({
          queryKey: statKey.me(userId),
          queryFn: statApi.fetchMyStats,
        })
      : statApi.fetchMyStats(),
  ]);

  await saveCharacterWidgetSnapshot(
    createCharacterWidgetSnapshot(user, stats, { themeName }),
  );
};
