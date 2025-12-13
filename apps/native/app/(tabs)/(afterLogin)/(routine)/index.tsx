import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Loading from '@/components/common/Loading';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import RoutineHeader from '@/components/routine/RoutineHeader';
import RoutineList from '@/components/routine/RoutineList';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const router = useRouter();
  const isFirstLoadRef = useRef(true);

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const { user } = useAuthStore();

  const {
    data: routines = [],
    isLoading,
    refetch,
  } = useRoutinesQuery(user?.nickname || '', date);

  useEffect(() => {
    if (!isLoading && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [isLoading]);

  const showLoading = isLoading && isFirstLoadRef.current;

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <Container style={styles.container}>
      <Header />
      <PullToRefresh onRefresh={handleRefresh}>
        <RoutineHeader date={date} />
        {showLoading ? (
          <Loading />
        ) : (
          <RoutineList routines={routines} date={date} />
        )}
      </PullToRefresh>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flex: 1,
  },
});
