import {
  useFriendProfileQuery,
  useFriendRoutinesQuery,
} from '@repo/shared/hooks/useFriend';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import {
  renderRoutineSceneAsset,
  getRoutineSceneRemoteAsset,
  type RoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import CharacterSpeechBubble from '@/feature/character/character-speech-bubble';
import RoutineCharacter from '@/feature/character/routine-character';
import { useScopedColorSchemeOverride } from '@/hooks/useScopedColorSchemeOverride';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { appThemes } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

const SPEECH_BUBBLE_BOTTOM_OFFSET =
  baseFoundation.dimension.x100 + baseFoundation.spacing[1];

interface FriendRoutineSceneBackgroundProps {
  backgroundAsset: RoutineSceneAsset;
}

const FriendRoutineSceneBackground = memo(
  ({ backgroundAsset }: FriendRoutineSceneBackgroundProps) => (
    <View style={styles.scene} pointerEvents="none">
      <View style={styles.backgroundArt}>
        {renderRoutineSceneAsset(backgroundAsset, {
          testID: 'friend-routine-scene-background',
          style: styles.backgroundImage,
          resizeMode: 'stretch',
        })}
      </View>
    </View>
  ),
);

FriendRoutineSceneBackground.displayName = 'FriendRoutineSceneBackground';

interface FriendRoutineCharacterStageProps {
  characterAsset: RoutineSceneAsset | null;
  speechBubbleMessage: string;
}

const FriendRoutineCharacterStage = memo(
  ({
    characterAsset,
    speechBubbleMessage,
  }: FriendRoutineCharacterStageProps) => (
    <View style={styles.characterStage}>
      {characterAsset ? (
        <RoutineCharacter
          asset={characterAsset}
          testID="friend-routine-scene-character"
        />
      ) : null}
      <View
        testID="friend-routine-character-speech-bubble"
        style={styles.speechBubble}
        pointerEvents="none"
      >
        <CharacterSpeechBubble message={speechBubbleMessage} />
      </View>
    </View>
  ),
);

FriendRoutineCharacterStage.displayName = 'FriendRoutineCharacterStage';

interface FriendRoutineDateSectionProps {
  children: ReactNode;
  friendId: string;
}

const FriendRoutineDateSection = ({
  children,
  friendId,
}: FriendRoutineDateSectionProps) => {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const [date, setDate] = useState(
    () => dateParam || getWeekMonday(new Date()),
  );
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);
  const { data, isLoading, isRefetching, refetch, isError } =
    useFriendRoutinesQuery(friendId, date);

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  const handleRefresh = useCallback(
    () => refetch().then(() => undefined),
    [refetch],
  );

  const handleDateChange = useCallback((targetDate: string) => {
    setDate(targetDate);
  }, []);

  const routines = data?.routines ?? [];
  const hasRoutines = routines.length > 0;
  const showRoutineList = !isLoading && !isError && !!data;

  return (
    <>
      <RoutineHeader
        date={date}
        onDateChange={handleDateChange}
        showNotification={false}
      />

      <View style={styles.content} testID="friend-routine-content">
        <View
          style={styles.routineListArea}
          onLayout={
            showRoutineList && hasRoutines
              ? handleRoutineListAreaLayout
              : undefined
          }
          testID={hasRoutines ? 'friend-routine-list-area' : undefined}
        >
          {isLoading ? (
            <Loading />
          ) : isError || !data ? (
            <EmptyState
              icon="alert-circle-outline"
              message="친구 루틴을 불러오지 못했습니다."
            />
          ) : (
            <RoutineList
              routines={routines}
              date={date}
              listAreaHeight={
                hasRoutines ? routineListAreaHeight || undefined : undefined
              }
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              readOnly
            />
          )}
        </View>
        {children}
      </View>
    </>
  );
};

const FriendRoutinesModal = () => {
  const { friendId } = useLocalSearchParams<{
    friendId?: string;
  }>();
  const { data: profile, isLoading: isProfileLoading } =
    useFriendProfileQuery(friendId);
  const profileThemeName = profile
    ? getThemeNameFromUserJob(profile)
    : undefined;
  const isProfileThemeApplied = useScopedColorSchemeOverride(profileThemeName);
  const appliedProfileThemeName = profileThemeName ?? 'blue';
  const backgroundImageUrl = profile?.backgroundImageUrl;
  const characterImageUrl = profile?.characterImageUrl;
  const backgroundAsset = useMemo(
    () => getRoutineSceneRemoteAsset(backgroundImageUrl),
    [backgroundImageUrl],
  );
  const characterAsset = useMemo(
    () => getRoutineSceneRemoteAsset(characterImageUrl),
    [characterImageUrl],
  );
  const speechBubbleMessage = profile?.motto?.trim() || '안녕?';

  if (!friendId) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="친구 정보를 불러올 수 없습니다."
      />
    );
  }

  if (isProfileLoading || !isProfileThemeApplied) {
    return <Loading />;
  }

  const profileTheme = appThemes[appliedProfileThemeName];

  return (
    <ThemeView
      style={[
        styles.container,
        { backgroundColor: profileTheme.colors.brand.secondary },
      ]}
    >
      {backgroundAsset ? (
        <FriendRoutineSceneBackground backgroundAsset={backgroundAsset} />
      ) : null}

      <FriendRoutineDateSection friendId={friendId}>
        <View style={styles.routineCharacterArea}>
          <FriendRoutineCharacterStage
            characterAsset={characterAsset}
            speechBubbleMessage={speechBubbleMessage}
          />
        </View>
      </FriendRoutineDateSection>
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
  characterStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  speechBubble: {
    bottom: SPEECH_BUBBLE_BOTTOM_OFFSET,
    position: 'absolute',
  },
}));
