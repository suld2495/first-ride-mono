import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import {
  renderRoutineSceneAsset,
  routineSceneAssets,
} from '@/components/routine/routine-scene-art';
import { IconButton } from '@/components/ui/icon-button';
import Loading from '@/components/ui/loading';
import { useAuthUser } from '@/hooks/useAuthSession';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

const ROUTINE_TAB_BAR_TOP_OFFSET = 72;
const ROUTINE_CHARACTER_BOTTOM_OFFSET = 86;

export default function Index() {
  const router = useRouter();
  const isFirstLoadRef = useRef(true);
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const user = useAuthUser();

  const {
    data: routines = [],
    isLoading,
    isRefetching,
    refetch,
  } = useRoutinesQuery(user?.nickname || '', date);
  const hasRoutines = routines.length > 0;

  useEffect(() => {
    if (!isLoading && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [isLoading]);

  const showLoading = isLoading && isFirstLoadRef.current;

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      {hasRoutines ? (
        <View style={styles.scene} pointerEvents="none">
          <View style={styles.backgroundArt}>
            {renderRoutineSceneAsset(routineSceneAssets.background, {
              testID: 'routine-scene-background',
              style: styles.backgroundImage,
              resizeMode: 'stretch',
            })}
          </View>
        </View>
      ) : null}
      <View style={styles.contentWrapper}>
        <RoutineHeader date={date} />
        {showLoading ? (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        ) : (
          <View style={styles.content} testID="routine-content">
            {hasRoutines ? (
              <>
                <View
                  style={styles.routineListArea}
                  onLayout={handleRoutineListAreaLayout}
                  testID="routine-list-area"
                >
                  <RoutineList
                    routines={routines}
                    date={date}
                    listAreaHeight={routineListAreaHeight || undefined}
                    refreshing={isRefetching}
                    onRefresh={handleRefresh}
                  />
                </View>
                <View
                  style={styles.routineCharacterArea}
                  pointerEvents="none"
                  testID="routine-character-area"
                >
                  {renderRoutineSceneAsset(routineSceneAssets.character, {
                    testID: 'routine-scene-character',
                    style: styles.characterImage,
                  })}
                </View>
              </>
            ) : (
              <RoutineList
                routines={routines}
                date={date}
                refreshing={isRefetching}
                onRefresh={handleRefresh}
              />
            )}
          </View>
        )}
      </View>
      <IconButton
        variant="ghost"
        icon={({ size }) => (
          <Ionicons name="add" size={size + 8} color="#FFFFFF" />
        )}
        onPress={() => router.push('/modal?type=routine-add')}
        accessibilityLabel="루틴 추가"
        accessibilityRole="button"
        testID="routine-add-fab"
        style={styles.fab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: '#A3D4FF',
  },
  scene: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  backgroundArt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: ROUTINE_TAB_BAR_TOP_OFFSET,
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 680 / 658,
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing.m,
  },
  loadingContainer: {
    flex: 1,
  },
  routineListArea: {
    flex: 7,
  },
  routineCharacterArea: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: theme.foundation.spacing.m,
    bottom: ROUTINE_CHARACTER_BOTTOM_OFFSET,
    width: baseFoundation.dimension.x60,
    height: baseFoundation.dimension.x60,
    minWidth: baseFoundation.dimension.x60,
    minHeight: baseFoundation.dimension.x60,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: '#0D3154',
    borderWidth: 2,
    borderColor: '#A9D6FF',
    shadowColor: '#0D3154',
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x6,
    },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  characterImage: {
    width: baseFoundation.dimension.x112,
    height: baseFoundation.dimension.x120,
  },
}));
