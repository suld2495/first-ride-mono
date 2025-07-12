import { FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';
import { getWeekMonday } from '@/utils/date-utils';

import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

import WeeklyRoutine from './WeeklyRoutine';

const RoutineList = () => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const searchParams = useLocalSearchParams();
  const { user } = useAuthStore();
  const date = (searchParams.date as string) || getWeekMonday(new Date());

  const { data } = useRoutinesQuery(user!.name, date);

  return (
    <ThemeView style={[styles.container]}>
      {data.length ? (
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <WeeklyRoutine
              key={item.routineId}
              isLast={index === data.length - 1}
              {...item}
            />
          )}
          keyExtractor={(item) => item.routineId.toString()}
          contentContainerStyle={styles.list}
        />
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
