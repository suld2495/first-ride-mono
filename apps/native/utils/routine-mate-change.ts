import type { Routine } from '@repo/types';

export const canChangeRoutineMate = (
  routine: Routine,
  nickname: string,
): boolean => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    routine.nickname === nickname &&
    !routine.isMe &&
    !!routine.mateNickname &&
    !routine.paused &&
    routine.startDate <= today &&
    (!routine.endDate || routine.endDate >= today)
  );
};
