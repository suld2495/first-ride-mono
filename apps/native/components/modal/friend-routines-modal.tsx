import {
  useAddFriendMutation,
  useFriendCheerMutation,
  useFriendRoutinesQuery,
} from '@repo/shared/hooks/useFriend';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import FriendCheerIcon from '@/components/icons/friend-cheer-icon';
import { useSetModalBackgroundColor } from '@/components/modal/modal-background-color-context';
import ModalHeaderAction from '@/components/modal/modal-header-action';
import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
  type RoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { useToast } from '@/contexts/ToastContext';
import CharacterMottoSpeechBubble from '@/feature/character/character-motto-speech-bubble';
import RoutineCharacter from '@/feature/character/routine-character';
import { useScopedColorSchemeOverride } from '@/hooks/useScopedColorSchemeOverride';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { getRoutineBackgroundColor } from '@/theme/routine-theme';
import { appThemes } from '@/theme/themes';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

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
      <CharacterMottoSpeechBubble
        isMine={false}
        message={speechBubbleMessage}
        testID="friend-routine-character-speech-bubble"
        style={styles.speechBubble}
      />
    </View>
  ),
);

FriendRoutineCharacterStage.displayName = 'FriendRoutineCharacterStage';

interface FriendRoutineHeaderActionProps {
  friendId: string;
  friendNickname: string;
  isFriend: boolean;
}

const FriendCheerHeaderAction = ({
  friendId,
}: Pick<FriendRoutineHeaderActionProps, 'friendId'>) => {
  const { isPending: isCheerPending, mutate: cheerFriend } =
    useFriendCheerMutation();
  const { showToast } = useToast();

  const handleCheer = useCallback(() => {
    cheerFriend(friendId, {
      onSuccess: () => {
        showToast('친구에게 응원을 보냈어요!', 'success');
      },
      onError: (error) => {
        showToast(
          getApiErrorMessage(error, '응원 콕을 보내지 못했습니다.'),
          'error',
        );
      },
    });
  }, [cheerFriend, friendId, showToast]);

  return (
    <ModalHeaderAction>
      <Button
        accessibilityLabel="응원 콕"
        accessibilityRole="button"
        backgroundColor={palette.white}
        contentStyle={styles.cheerButtonContent}
        disabled={isCheerPending}
        leftIcon={
          isCheerPending ? (
            <LoadingSpinner
              size={baseFoundation.iconSize.xs}
              strokeWidth={3}
              testID="friend-cheer-loading-icon"
            />
          ) : (
            <FriendCheerIcon />
          )
        }
        onPress={handleCheer}
        size="sm"
        style={styles.cheerButton}
        textColor={palette.theme.gray[70]}
        textStyle={styles.cheerButtonText}
        variant="ghost"
      >
        응원
      </Button>
    </ModalHeaderAction>
  );
};

const FriendAddHeaderAction = ({
  friendNickname,
}: Pick<FriendRoutineHeaderActionProps, 'friendNickname'>) => {
  const addFriendMutation = useAddFriendMutation();
  const { showToast } = useToast();
  const requestInFlightRef = useRef(false);
  const [isRequested, setIsRequested] = useState(false);

  const handleAddFriend = useCallback(() => {
    if (requestInFlightRef.current || isRequested) {
      return;
    }

    requestInFlightRef.current = true;
    addFriendMutation.mutate(friendNickname, {
      onSuccess: () => {
        setIsRequested(true);
        showToast('친구 요청을 보냈습니다.', 'success');
      },
      onError: (error) => {
        showToast(
          getApiErrorMessage(error, '친구 추가에 실패했습니다.'),
          'error',
        );
      },
      onSettled: () => {
        requestInFlightRef.current = false;
      },
    });
  }, [addFriendMutation, friendNickname, isRequested, showToast]);

  return (
    <ModalHeaderAction>
      <Button
        accessibilityLabel={isRequested ? '친구 요청 완료' : '친구 추가'}
        accessibilityRole="button"
        backgroundColor={palette.white}
        disabled={isRequested}
        loading={addFriendMutation.isPending}
        onPress={handleAddFriend}
        size="sm"
        style={styles.friendAddButton}
        textColor={palette.theme.gray[70]}
        textStyle={styles.cheerButtonText}
        variant="ghost"
      >
        {isRequested ? '요청 완료' : '친구 추가'}
      </Button>
    </ModalHeaderAction>
  );
};

const FriendRoutineHeaderAction = ({
  friendId,
  friendNickname,
  isFriend,
}: FriendRoutineHeaderActionProps) =>
  isFriend ? (
    <FriendCheerHeaderAction friendId={friendId} />
  ) : (
    <FriendAddHeaderAction friendNickname={friendNickname} />
  );

interface FriendRoutineDateSectionProps {
  children: ReactNode;
  data: FriendRoutinesData | undefined;
  date: string;
  friendId: string;
  isError: boolean;
  isLoading: boolean;
  isRefetching: boolean;
  onDateChange: (date: string) => void;
  onRefresh: () => Promise<void>;
  routineColorFallback: string;
}

type FriendRoutinesData = NonNullable<
  ReturnType<typeof useFriendRoutinesQuery>['data']
>;

const FriendRoutineDateSection = ({
  children,
  data,
  date,
  friendId,
  isError,
  isLoading,
  isRefetching,
  onDateChange,
  onRefresh,
  routineColorFallback,
}: FriendRoutineDateSectionProps) => {
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  const routines = data?.routines ?? [];
  const hasRoutines = routines.length > 0;
  const showRoutineList = !isLoading && !isError && !!data;

  return (
    <>
      {data ? (
        <FriendRoutineHeaderAction
          friendId={friendId}
          friendNickname={data.friend.nickname}
          isFriend={data.isFriend}
        />
      ) : null}

      <RoutineHeader
        date={date}
        onDateChange={onDateChange}
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
              onRefresh={onRefresh}
              readOnly
              routineColorFallback={routineColorFallback}
            />
          )}
        </View>
        {children}
      </View>
    </>
  );
};

const FriendRoutinesModal = () => {
  const { friendId, date: dateParam } = useLocalSearchParams<{
    friendId?: string;
    date?: string;
  }>();
  const [date, setDate] = useState(
    () => dateParam || getWeekMonday(new Date()),
  );
  const { data, isLoading, isRefetching, refetch, isError } =
    useFriendRoutinesQuery(friendId, date);
  const friend = data?.friend;
  const friendThemeName = friend ? getThemeNameFromUserJob(friend) : undefined;
  const isFriendThemeApplied = useScopedColorSchemeOverride(friendThemeName);
  const appliedFriendThemeName = friendThemeName ?? 'blue';
  const routineBackgroundColor = getRoutineBackgroundColor(
    appliedFriendThemeName,
  );
  const setModalBackgroundColor = useSetModalBackgroundColor();
  const backgroundImageUrl = friend?.backgroundImageUrl;
  const characterImageUrl = friend?.characterImageUrl;
  const backgroundAsset = useMemo(
    () => getRoutineSceneRemoteAsset(backgroundImageUrl),
    [backgroundImageUrl],
  );
  const characterAsset = useMemo(
    () => getRoutineSceneRemoteAsset(characterImageUrl),
    [characterImageUrl],
  );
  const speechBubbleMessage = friend?.motto?.trim() || '안녕?';

  const handleRefresh = useCallback(
    () => refetch().then(() => undefined),
    [refetch],
  );

  const handleDateChange = useCallback((targetDate: string) => {
    setDate(targetDate);
  }, []);

  useEffect(() => {
    setModalBackgroundColor?.(routineBackgroundColor);

    return () => setModalBackgroundColor?.(undefined);
  }, [routineBackgroundColor, setModalBackgroundColor]);

  if (!friendId) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="친구 정보를 불러올 수 없습니다."
      />
    );
  }

  if (isLoading || !isFriendThemeApplied) {
    return <Loading />;
  }

  const friendTheme = appThemes[appliedFriendThemeName];

  return (
    <ThemeView
      style={[styles.container, { backgroundColor: routineBackgroundColor }]}
    >
      {backgroundAsset ? (
        <FriendRoutineSceneBackground backgroundAsset={backgroundAsset} />
      ) : null}

      <FriendRoutineDateSection
        data={data}
        date={date}
        friendId={friendId}
        isError={isError}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onDateChange={handleDateChange}
        onRefresh={handleRefresh}
        routineColorFallback={friendTheme.colors.brand.primary}
      >
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
    position: 'relative',
  },
  cheerButton: {
    borderColor: palette.theme.gray[50],
    borderRadius: baseFoundation.dimension.x8,
    borderWidth: baseFoundation.dimension.x1,
    height: baseFoundation.dimension.x30,
    minHeight: baseFoundation.dimension.x30,
    minWidth: 67,
    opacity: 1,
    paddingHorizontal: baseFoundation.spacing[0],
    width: 67,
  },
  cheerButtonContent: {
    gap: baseFoundation.dimension.x3,
  },
  friendAddButton: {
    borderColor: palette.theme.gray[50],
    borderRadius: baseFoundation.dimension.x8,
    borderWidth: baseFoundation.dimension.x1,
    height: baseFoundation.dimension.x30,
    minHeight: baseFoundation.dimension.x30,
    minWidth: baseFoundation.dimension.x80,
    opacity: 1,
    paddingHorizontal: baseFoundation.spacing[0],
    width: baseFoundation.dimension.x80,
  },
  cheerButtonText: {
    fontSize: baseFoundation.typography.size.caption1,
  },
  characterStage: {
    alignItems: 'center',
    alignSelf: 'center',
    bottom: baseFoundation.dimension.x48,
    justifyContent: 'center',
    position: 'absolute',
  },
  speechBubble: {
    bottom: SPEECH_BUBBLE_BOTTOM_OFFSET,
    position: 'absolute',
  },
}));
