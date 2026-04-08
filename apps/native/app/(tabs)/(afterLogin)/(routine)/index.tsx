import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import Loading from '@/components/ui/loading';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useAuthUser } from '@/hooks/useAuthSession';

export default function Index() {
  const router = useRouter();
  const isFirstLoadRef = useRef(true);

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const user = useAuthUser();

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
    <Container style={styles.container} noPadding>
      <Header />
      <PullToRefresh onRefresh={handleRefresh}>
        <RoutineHeader date={date} />
        {showLoading ? (
          <Loading />
        ) : (
          <View style={styles.content}>
            <RoutineList routines={routines} date={date} />
          </View>
        )}
      </PullToRefresh>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.foundation.spacing.m,
  },
}));
