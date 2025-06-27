export const routineKey = {
  routine: ['routine'],
  list: (nickname: string) => [...routineKey.routine, nickname],
  detail: (id: number) => [...routineKey.routine, id],
};
