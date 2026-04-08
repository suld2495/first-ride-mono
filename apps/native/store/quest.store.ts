import type { QuestStatusFilter, QuestTypeFilter } from '@repo/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type { QuestStatusFilter, QuestTypeFilter };

interface State {
  questId: number | null;
  statusFilter: QuestStatusFilter;
  typeFilter: QuestTypeFilter;
}

interface Action {
  setQuestId: (id: number) => void;
  setStatusFilter: (status: QuestStatusFilter) => void;
  setTypeFilter: (type: QuestTypeFilter) => void;
}

const initialState: State = {
  questId: null,
  statusFilter: 'ALL',
  typeFilter: 'ALL',
};

export const useQuestStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setQuestId: (id: number) => set({ questId: id }),
    setStatusFilter: (status: QuestStatusFilter) =>
      set({ statusFilter: status }),
    setTypeFilter: (type: QuestTypeFilter) => set({ typeFilter: type }),
  })),
);
