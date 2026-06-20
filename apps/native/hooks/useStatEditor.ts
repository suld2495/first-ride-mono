import { useStatStore } from '@/store/stat.store';

export const useStatEditor = () => {
  const isEditing = useStatStore((state) => state.isEditing);
  const originalStats = useStatStore((state) => state.originalStats);
  const pendingStats = useStatStore((state) => state.pendingStats);
  const availablePoints = useStatStore((state) => state.availablePoints);
  const usedPoints = useStatStore((state) => state.usedPoints);
  const startEditing = useStatStore((state) => state.startEditing);
  const incrementStat = useStatStore((state) => state.incrementStat);
  const decrementStat = useStatStore((state) => state.decrementStat);
  const resetChanges = useStatStore((state) => state.resetChanges);
  const finishEditing = useStatStore((state) => state.finishEditing);
  const getDistributions = useStatStore((state) => state.getDistributions);

  return {
    isEditing,
    originalStats,
    pendingStats,
    availablePoints,
    usedPoints,
    startEditing,
    incrementStat,
    decrementStat,
    resetChanges,
    finishEditing,
    getDistributions,
  };
};
