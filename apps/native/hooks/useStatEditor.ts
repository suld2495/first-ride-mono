import { useStatStore } from '@/store/stat.store';

export const useStatEditor = () =>
  useStatStore((state) => ({
    isEditing: state.isEditing,
    originalStats: state.originalStats,
    pendingStats: state.pendingStats,
    availablePoints: state.availablePoints,
    usedPoints: state.usedPoints,
    startEditing: state.startEditing,
    incrementStat: state.incrementStat,
    decrementStat: state.decrementStat,
    resetChanges: state.resetChanges,
    finishEditing: state.finishEditing,
    getDistributions: state.getDistributions,
  }));
