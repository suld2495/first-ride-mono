import { StyleSheet } from 'react-native';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import RoutineHeader from '@/components/routine/RoutineHeader';
import RoutineList from '@/components/routine/RoutineList';

export default function Index() {
  const router = useRouter();

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const { user } = useAuthStore();

  const { data: routines, isLoading } = useRoutinesQuery(
    user?.nickname || '',
    date,
  );

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <Container style={styles.container}>
      <Header />
      <RoutineHeader date={date} />
      <RoutineList routines={routines} date={date} />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flex: 1,
  },
});
