import { StyleSheet } from 'react-native-unistyles';
import { Routine } from '@repo/types';
import { useRouter } from 'expo-router';

import { useRoutineStore } from '@/store/routine.store';

import EmptyState from '../common/EmptyState';
import ThemeView from '../common/ThemeView';

import { RoutineCountList, RoutineWeekList } from './WeeklyRoutine';

interface RoutineListProps {
  routines: Routine[];
  date: string;
}

const RoutineList = ({ routines, date }: RoutineListProps) => {
  const setRoutineId = useRoutineStore((state) => state.setRoutineId);
  const type = useRoutineStore((state) => state.type);
  const router = useRouter();

  const handleShowRequestModal = (id: number) => {
    router.push('/modal?type=request');
    setRoutineId(id);
  };

  const handleShowDetailModal = (id: number) => {
    router.push('/modal?type=routine-detail');
    setRoutineId(id);
  };

  return (
    <ThemeView style={styles.container}>
      {routines.length ? (
        type === 'number' ? (
          <RoutineCountList
            routines={routines}
            date={date}
            onShowRequestModal={handleShowRequestModal}
            onShowDetailModal={handleShowDetailModal}
          />
        ) : (
          <RoutineWeekList
            routines={routines}
            date={date}
            onShowRequestModal={handleShowRequestModal}
            onShowDetailModal={handleShowDetailModal}
          />
        )
      ) : (
        <EmptyState icon="list-outline" message="등록된 루틴이 없습니다." />
      )}
    </ThemeView>
  );
};

export default RoutineList;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.foundation.spacing.m,
    flex: 1,
  },
  list: {
    gap: theme.foundation.spacing.m,
  },
}));
