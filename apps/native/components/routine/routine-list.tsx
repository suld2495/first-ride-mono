import Ionicons from '@expo/vector-icons/Ionicons';
import type { Routine } from '@repo/types';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

import EmptyState from '@/components/ui/empty-state';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useRoutineType, useSetRoutineId } from '@/hooks/useRoutineSelection';

import { RoutineCountList, RoutineWeekList } from './weekly-routine';

interface RoutineListProps {
  routines: Routine[];
  date: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

const RoutineList = ({
  routines,
  date,
  refreshing = false,
  onRefresh,
}: RoutineListProps) => {
  const setRoutineId = useSetRoutineId();
  const type = useRoutineType();
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            onShowRequestModal={handleShowRequestModal}
            onShowDetailModal={handleShowDetailModal}
          />
        ) : (
          <RoutineWeekList
            routines={routines}
            date={date}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onShowRequestModal={handleShowRequestModal}
            onShowDetailModal={handleShowDetailModal}
          />
        )
      ) : (
        <EmptyState icon="list-outline" message="등록된 루틴이 없습니다." />
      )}
      {routines.length > 4 ? (
        <View style={styles.scrollIndicator} testID="routine-scroll-indicator">
          <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
          <Typography variant="caption" color="#FFFFFF">
            아래로 더 보기
          </Typography>
        </View>
      ) : null}
    </ThemeView>
  );
};

export default RoutineList;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.foundation.spacing.m,
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 2,
  },
}));
