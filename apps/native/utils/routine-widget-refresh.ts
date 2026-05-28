import * as routineApi from '@repo/shared/api/routine.api';
import { routineKey } from '@repo/shared/types/query-keys/routine';
import { getWeekMonday } from '@repo/shared/utils';
import type { QueryClient } from '@tanstack/react-query';

import type { ThemeName } from '@/theme/themes';
import { createRoutineWidgetSnapshot } from '@/widget/routine-widget';
import { saveRoutineWidgetSnapshot } from '@/widget/routine-widget-native';

interface RefreshRoutineWidgetSnapshotParams {
  nickname: string;
  themeName?: ThemeName;
  date?: string;
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
        queryKey: routineKey.listByDate(nickname, date),
        queryFn: () => routineApi.fetchRoutines(date),
      })
    : await routineApi.fetchRoutines(date);

  await saveRoutineWidgetSnapshot(
    createRoutineWidgetSnapshot(routines, { themeName }),
  );
};
