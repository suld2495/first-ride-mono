import { useFriendRoutinesQuery } from '@repo/shared/hooks/useFriend';
import { getWeekMonday } from '@repo/shared/utils';
import type { Href } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import {
  renderRoutineSceneAsset,
  routineSceneAssets,
} from '@/components/routine/routine-scene-art';
import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import RoutineCharacter from '@/feature/character/routine-character';
import { baseFoundation } from '@/theme/tokens';

const FriendRoutinesModal = () => {
  const {
    friendId,
    friendNickname,
    date: dateParam,
  } = useLocalSearchParams<{
    friendId?: string;
    friendNickname?: string;
    date?: string;
  }>();
  const date = dateParam || getWeekMonday(new Date());
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);

  const { data, isLoading, isRefetching, refetch, isError } =
    useFriendRoutinesQuery(friendId, date);

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const getDateHref = useCallback(
    (targetDate: string) =>
      `/modal?type=friend-routines&friendId=${friendId}&friendNickname=${encodeURIComponent(
        friendNickname ?? '',
      )}&date=${targetDate}` as Href,
    [friendId, friendNickname],
  );

  if (!friendId) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="친구 정보를 불러올 수 없습니다."
      />
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="친구 루틴을 불러오지 못했습니다."
      />
    );
  }

  const { routines } = data;
  const hasRoutines = routines.length > 0;

  return (
    <ThemeView style={styles.container}>
      <View style={styles.scene} pointerEvents="none">
        <View style={styles.backgroundArt}>
          {renderRoutineSceneAsset(routineSceneAssets.background, {
            testID: 'friend-routine-scene-background',
            style: styles.backgroundImage,
            resizeMode: 'stretch',
          })}
        </View>
      </View>

      <RoutineHeader
        date={date}
        getDateHref={getDateHref}
        showNotification={false}
      />

      <View style={styles.content} testID="friend-routine-content">
        {hasRoutines ? (
          <>
            <View
              style={styles.routineListArea}
              onLayout={handleRoutineListAreaLayout}
              testID="friend-routine-list-area"
            >
              <RoutineList
                routines={routines}
                date={date}
                listAreaHeight={routineListAreaHeight || undefined}
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                readOnly
              />
            </View>
            <View style={styles.routineCharacterArea}>
              <RoutineCharacter />
            </View>
          </>
        ) : (
          <RoutineList
            routines={routines}
            date={date}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            readOnly
          />
        )}
      </View>
    </ThemeView>
  );
};

export default FriendRoutinesModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: theme.colors.brand.secondary,
  },
  scene: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
  },
  backgroundArt: {
    position: 'absolute',
    left: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 680 / 658,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing[4],
  },
  routineListArea: {
    flex: 7,
  },
  routineCharacterArea: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
