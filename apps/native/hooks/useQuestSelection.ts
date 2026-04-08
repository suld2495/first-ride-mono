import { useQuestStore } from '@/store/quest.store';

export const useSelectedQuestId = () => useQuestStore((state) => state.questId);

export const useQuestId = useSelectedQuestId;

export const useQuestStatusFilter = () =>
  useQuestStore((state) => state.statusFilter);

export const useQuestTypeFilter = () =>
  useQuestStore((state) => state.typeFilter);

export const useSelectQuest = () => useQuestStore((state) => state.setQuestId);

export const useSetQuestId = useSelectQuest;

export const useSetQuestStatusFilter = () =>
  useQuestStore((state) => state.setStatusFilter);

export const useSetQuestTypeFilter = () =>
  useQuestStore((state) => state.setTypeFilter);
