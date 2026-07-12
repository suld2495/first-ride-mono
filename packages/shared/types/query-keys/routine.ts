export const routineKeys = {
  all: () => ['routine'] as const,
  list: (nickname: string) => [...routineKeys.all(), nickname] as const,
  allList: (nickname: string) =>
    [...routineKeys.list(nickname), 'all'] as const,
  pausedList: (nickname: string) =>
    [...routineKeys.list(nickname), 'paused'] as const,
  monthlyList: (nickname: string, year: number, month: number) =>
    [...routineKeys.list(nickname), 'monthly', { year, month }] as const,
  listByDate: (nickname: string, date: string) =>
    [...routineKeys.list(nickname), { date }] as const,
  detail: (id: number) => [...routineKeys.all(), id] as const,
};

export const routineKey = routineKeys;
