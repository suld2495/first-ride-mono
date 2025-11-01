import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type QuestStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
export type QuestTypeFilter = 'ALL' | 'DAILY' | 'WEEKLY';

interface State {
  questId: number;
  statusFilter: QuestStatus;
  typeFilter: QuestTypeFilter;
}

interface Action {
  setQuestId: (id: number) => void;
  setStatusFilter: (status: QuestStatus) => void;
  setTypeFilter: (type: QuestTypeFilter) => void;
}

const initialState: State = {
  questId: 0,
  statusFilter: 'ALL',
  typeFilter: 'ALL',
};

export const useQuestStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setQuestId: (id: number) => set({ questId: id }),
    setStatusFilter: (status: QuestStatus) => set({ statusFilter: status }),
    setTypeFilter: (type: QuestTypeFilter) => set({ typeFilter: type }),
  })),
);
