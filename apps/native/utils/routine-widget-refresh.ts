import * as routineApi from '@repo/shared/api/routine.api';
import * as statApi from '@repo/shared/api/stat.api';
import * as userApi from '@repo/shared/api/user.api';
import { routineKeys } from '@repo/shared/types/query-keys/routine';
import { statKey } from '@repo/shared/types/query-keys/stat';
import { userKey } from '@repo/shared/types/query-keys/user';
import { getWeekMonday } from '@repo/shared/utils';
import type { User } from '@repo/types';
import type { QueryClient } from '@tanstack/react-query';

import { syncRoutineShareTargets } from '@/share/routine-share';
import type { ThemeName } from '@/theme/themes';
import {
  createCharacterWidgetSnapshot,
  createRoutineWidgetSnapshot,
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

export const refreshRoutineWidgetSnapshot = async ({
  nickname,
  themeName,
  date = getWeekMonday(new Date()),
  queryClient,
}: RefreshRoutineWidgetSnapshotParams): Promise<void> => {
  if (!nickname) {
    return;
  }

  const routines = queryClient
    ? await queryClient.fetchQuery({
        queryKey: routineKeys.listByDate(nickname, date),
        queryFn: () => routineApi.fetchRoutines(date),
      })
    : await routineApi.fetchRoutines(date);

  await saveRoutineWidgetSnapshot(
    createRoutineWidgetSnapshot(routines, { themeName }),
  );
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
