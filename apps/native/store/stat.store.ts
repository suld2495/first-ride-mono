import type { StatKey, UserStats } from '@repo/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface StatState {
  isEditing: boolean;
  originalStats: UserStats | null;
  pendingStats: UserStats | null;
  availablePoints: number;
  usedPoints: number;
}

interface StatActions {
  startEditing: (stats: UserStats, availablePoints: number) => void;
  incrementStat: (key: keyof UserStats) => void;
  decrementStat: (key: keyof UserStats) => void;
  resetChanges: () => void;
  finishEditing: () => void;
  getDistributions: () => Partial<Record<StatKey, number>>;
}

const initialState: StatState = {
  isEditing: false,
  originalStats: null,
  pendingStats: null,
  availablePoints: 0,
  usedPoints: 0,
};

const statKeyToApiKey: Record<keyof UserStats, StatKey> = {
  strength: 'STRENGTH',
  agility: 'AGILITY',
  intelligence: 'INTELLIGENCE',
  luck: 'LUCK',
  vitality: 'VITALITY',
  mana: 'MANA',
};

export const useStatStore = create<StatState & StatActions>()(
  devtools((set, get) => ({
    ...initialState,

    startEditing: (stats: UserStats, availablePoints: number) => {
      set({
        isEditing: true,
        originalStats: stats,
        pendingStats: { ...stats },
        availablePoints,
        usedPoints: 0,
      });
    },

    incrementStat: (key: keyof UserStats) => {
      const { pendingStats, availablePoints, usedPoints } = get();
      if (!pendingStats || usedPoints >= availablePoints) return;

      set({
        pendingStats: {
          ...pendingStats,
          [key]: pendingStats[key] + 1,
        },
        usedPoints: usedPoints + 1,
      });
    },

    decrementStat: (key: keyof UserStats) => {
      const { pendingStats, originalStats, usedPoints } = get();
      if (!pendingStats || !originalStats) return;
      if (pendingStats[key] <= originalStats[key]) return;

      set({
        pendingStats: {
          ...pendingStats,
          [key]: pendingStats[key] - 1,
        },
        usedPoints: usedPoints - 1,
      });
    },

    resetChanges: () => {
      const { originalStats } = get();
      if (!originalStats) return;

      set({
        pendingStats: { ...originalStats },
        usedPoints: 0,
      });
    },

    finishEditing: () => {
      set(initialState);
    },

    getDistributions: () => {
      const { originalStats, pendingStats } = get();
      if (!originalStats || !pendingStats) return {};

      const distributions: Partial<Record<StatKey, number>> = {};

      (Object.keys(originalStats) as Array<keyof UserStats>).forEach((key) => {
        const diff = pendingStats[key] - originalStats[key];
        if (diff > 0) {
          distributions[statKeyToApiKey[key]] = diff;
        }
      });

      return distributions;
    },
  })),
);
