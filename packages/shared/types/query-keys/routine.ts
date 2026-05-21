export const routineKey = {
  all: () => ['routine'] as const,
  list: (nickname: string) => [...routineKey.all(), nickname] as const,
  allList: (nickname: string) => [...routineKey.list(nickname), 'all'] as const,
  pausedList: (nickname: string) =>
    [...routineKey.list(nickname), 'paused'] as const,
  listByDate: (nickname: string, date: string) =>
    [...routineKey.list(nickname), { date }] as const,
  detail: (id: number) => [...routineKey.all(), id] as const,
};
