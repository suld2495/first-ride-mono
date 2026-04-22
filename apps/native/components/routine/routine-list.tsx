import Ionicons from '@expo/vector-icons/Ionicons';
import type { Routine } from '@repo/types';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import EmptyState from '@/components/ui/empty-state';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useRoutineType, useSetRoutineId } from '@/hooks/useRoutineSelection';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation, palette } from '@/theme/tokens';

import { RoutineCountList, RoutineWeekList } from './weekly-routine';

interface RoutineListProps {
  routines: Routine[];
  date: string;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

const MAX_VISIBLE_ROUTINES = 4;
const ROUTINE_VISIBLE_ITEM_HEIGHT = 120;
const ROUTINE_VIEWPORT_BOTTOM_PADDING = 12;
const MAX_VISIBLE_ROUTINE_LIST_HEIGHT =
  MAX_VISIBLE_ROUTINES * ROUTINE_VISIBLE_ITEM_HEIGHT +
  ROUTINE_VIEWPORT_BOTTOM_PADDING;

const RoutineList = ({
  routines,
  date,
  refreshing = false,
  onRefresh,
}: RoutineListProps) => {
  const setRoutineId = useSetRoutineId();
  const type = useRoutineType();
  const router = useRouter();
  const isScrollableList = routines.length > MAX_VISIBLE_ROUTINES;

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
        <ThemeView
          style={[
            styles.listViewport,
            isScrollableList ? styles.listViewportFixedHeight : null,
          ]}
          testID="routine-list-viewport"
        >
          {type === 'number' ? (
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
          )}
        </ThemeView>
      ) : (
        <EmptyState icon="list-outline" message="등록된 루틴이 없습니다." />
      )}
      {routines.length > 4 ? (
        <View style={styles.scrollIndicatorContainer}>
          <View
            style={styles.scrollIndicator}
            testID="routine-scroll-indicator"
          >
            <Ionicons
              name="chevron-down"
              size={baseFoundation.dimension.x18}
              color="#4C769C"
            />
          </View>
        </View>
      ) : null}
    </ThemeView>
  );
};

export default RoutineList;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.foundation.spacing.s,
    flex: 1,
    backgroundColor: 'transparent',
  },
  listViewport: {
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  listViewportFixedHeight: {
    height: MAX_VISIBLE_ROUTINE_LIST_HEIGHT,
  },
  scrollIndicatorContainer: {
    alignItems: 'center',
  },
  scrollIndicator: {
    marginTop: baseFoundation.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.dimension.x2,
    borderRadius: 8,
    borderWidth: 1,
    width: 60,
    height: 24,
    borderColor: '#83B0D6',
    backgroundColor: '#B0DAFF',
  },
}));
