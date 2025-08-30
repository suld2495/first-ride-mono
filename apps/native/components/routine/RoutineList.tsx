import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

import { RoutineCountList, RoutineWeekList } from './WeeklyRoutine';
import { Routine } from '@repo/types';
import { useRoutineStore } from '@/store/routine.store';
import { useRouter } from 'expo-router';

interface RoutineListProps {
  routines: Routine[];
  date: string;
}

const RoutineList = ({ routines, date }: RoutineListProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

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
    <ThemeView style={[styles.container]}>
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
        <ThemeView style={styles.empty}>
          <ThemeText style={styles.emptyText}>
            등록된 루틴이 없습니다.
          </ThemeText>
        </ThemeView>
      )}
    </ThemeView>
  );
};

export default RoutineList;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      marginTop: 40,
      flex: 1,
    },
    empty: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS[colorScheme].backgroundGrey,
      borderRadius: 10,
      height: 100,
    },
    emptyText: {
      color: COLORS[colorScheme].text,
    },
    list: {
      gap: 15,
    },
  });
