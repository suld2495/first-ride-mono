import { StyleSheet } from 'react-native';
import { Routine } from '@repo/types';
import { useRouter } from 'expo-router';

import { useRoutineStore } from '@/store/routine.store';

import { Card } from '../common/Card';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

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
        <Card variant="raised" padding="lg" style={styles.empty}>
          <Typography style={styles.emptyText}>
            등록된 루틴이 없습니다.
          </Typography>
        </Card>
      )}
    </ThemeView>
  );
};

export default RoutineList;

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  emptyText: {
    textAlign: 'center',
  },
  list: {
    gap: 15,
  },
});
