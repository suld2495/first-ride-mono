import type { StatResponse } from '@repo/types';

export type LevelProgressSnapshot = Pick<StatResponse, 'currentLevel'> & {
  evolutionCount?: number;
};

export type LevelProgressCelebration =
  | {
      type: 'level-up';
      previousLevel: number;
      currentLevel: number;
      previousEvolutionCount: number;
      currentEvolutionCount: number;
    }
  | {
      type: 'evolution';
      previousLevel: number;
      currentLevel: number;
      previousEvolutionCount: number;
      currentEvolutionCount: number;
    };

export type LevelUpStatusCelebration = {
  type: 'level-up-status';
  currentLevel: number;
};

const normalizeEvolutionCount = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const getEvolutionCountFromLevel = (level: number) => {
  if (level >= 10) {
    return 2;
  }

  if (level >= 5) {
    return 1;
  }

  return 0;
};

const getEffectiveEvolutionCount = ({
  currentLevel,
  evolutionCount,
}: LevelProgressSnapshot) =>
  Math.max(
    normalizeEvolutionCount(evolutionCount),
    getEvolutionCountFromLevel(currentLevel),
  );

export const createLevelProgressCelebration = (
  previous: LevelProgressSnapshot | null,
  current: LevelProgressSnapshot | null,
): LevelProgressCelebration | null => {
  if (!previous || !current) {
    return null;
  }

  const previousLevel = previous.currentLevel;
  const currentLevel = current.currentLevel;
  const previousEvolutionCount = getEffectiveEvolutionCount(previous);
  const currentEvolutionCount = getEffectiveEvolutionCount(current);

  if (
    currentEvolutionCount > previousEvolutionCount &&
    currentLevel > previousLevel
  ) {
    return {
      type: 'evolution',
      previousLevel,
      currentLevel,
      previousEvolutionCount,
      currentEvolutionCount,
    };
  }

  if (currentLevel > previousLevel) {
    return {
      type: 'level-up',
      previousLevel,
      currentLevel,
      previousEvolutionCount,
      currentEvolutionCount,
    };
  }

  return null;
};
