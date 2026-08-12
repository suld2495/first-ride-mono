import {
  useAddFriendMutation,
  useRandomFriendRecommendationQuery,
} from '@repo/shared/hooks/useFriend';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  getRoutineSceneBackgroundAsset,
  getRoutineSceneCharacterAsset,
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import CharacterSpeechBubble from '@/feature/character/character-speech-bubble';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { appThemes } from '@/theme/themes';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const CARD_HEIGHT = baseFoundation.dimension.x320;
const CHARACTER_SIZE = baseFoundation.dimension.x180;
const PROFILE_HEIGHT = baseFoundation.dimension.x60;
const FRIEND_REQUEST_ERROR_MESSAGE =
  '친구 요청을 보내지 못했습니다. 다시 시도해주세요.';
const RECOMMENDATION_ERROR_MESSAGE =
  '추천 친구를 불러오지 못했습니다.\n잠시 후 다시 시도해주세요.';

const RandomFriendRecommendation = () => {
  const {
    data: recommendation,
    error,
    isLoading,
    refetch,
  } = useRandomFriendRecommendationQuery();
  const addFriendMutation = useAddFriendMutation();
  const { showToast } = useToast();
  const requestInFlightRef = useRef(false);
  const [requestedNickname, setRequestedNickname] = useState<string | null>(
    null,
  );
  const profileThemeName = getThemeNameFromUserJob(recommendation);
  const profileTheme = appThemes[profileThemeName];
  const backgroundAsset = useMemo(
    () =>
      getRoutineSceneRemoteAsset(recommendation?.backgroundImageUrl) ??
      getRoutineSceneBackgroundAsset(profileThemeName),
    [profileThemeName, recommendation?.backgroundImageUrl],
  );
  const characterAsset = useMemo(
    () =>
      getRoutineSceneRemoteAsset(recommendation?.characterImageUrl) ??
      getRoutineSceneCharacterAsset(profileThemeName),
    [profileThemeName, recommendation?.characterImageUrl],
  );
  const isRequested = requestedNickname === recommendation?.nickname;

  const handleRequestFriend = () => {
    if (!recommendation || requestInFlightRef.current || isRequested) {
      return;
    }

    requestInFlightRef.current = true;
    addFriendMutation.mutate(recommendation.nickname, {
      onSuccess: () => {
        setRequestedNickname(recommendation.nickname);
        showToast('친구 요청을 보냈습니다.', 'success');
      },
      onError: (requestError) => {
        showToast(
          getApiErrorMessage(requestError, FRIEND_REQUEST_ERROR_MESSAGE),
          'error',
        );
      },
      onSettled: () => {
        requestInFlightRef.current = false;
      },
    });
  };

  const handleRetry = () => {
    void refetch();
  };

  const errorMessage = error
    ? getApiErrorMessage(error, RECOMMENDATION_ERROR_MESSAGE)
    : RECOMMENDATION_ERROR_MESSAGE;

  return (
    <View style={styles.section} testID="random-friend-recommendation">
      <Typography
        variant="subtitle2"
        weight="semibold"
        color={appThemes.green.colors.brand.primary}
      >
        랜덤 친구 추천
      </Typography>

      {isLoading ? (
        <View style={styles.stateCard} testID="random-friend-loading">
          <Loading />
        </View>
      ) : !recommendation ? (
        <View style={styles.stateCard} testID="random-friend-error">
          <Typography
            variant="body2"
            color={appThemes.green.colors.brand.text}
            textAlign="center"
            style={styles.errorMessage}
          >
            {errorMessage}
          </Typography>
          <Button
            title="다시 시도"
            variant="ghost"
            size="sm"
            onPress={handleRetry}
            backgroundColor={appThemes.green.colors.brand.text}
            textColor={palette.white}
          />
        </View>
      ) : (
        <View
          accessibilityLabel={`${recommendation.nickname} 추천 친구`}
          style={styles.card}
          testID="random-friend-card"
        >
          <View style={styles.backgroundArt} pointerEvents="none">
            {renderRoutineSceneAsset(backgroundAsset, {
              testID: 'random-friend-background',
              style: styles.backgroundImage,
              resizeMode: 'cover',
            })}
          </View>

          {recommendation.motto?.trim() ? (
            <CharacterSpeechBubble
              containerMinWidth={baseFoundation.dimension.x140}
              maxWidth={baseFoundation.dimension.x220}
              message={recommendation.motto.trim()}
              numberOfLines={2}
              style={styles.speechBubble}
              testID="random-friend-speech-bubble"
              textVariant="body2"
              themeName={profileThemeName}
            />
          ) : null}

          <View style={styles.characterStage} pointerEvents="none">
            {renderRoutineSceneAsset(characterAsset, {
              testID: 'random-friend-character',
              style: styles.characterImage,
              resizeMode: 'contain',
            })}
          </View>

          <View
            style={[
              styles.profile,
              { backgroundColor: profileTheme.colors.brand.background },
            ]}
          >
            <View style={styles.identity}>
              <Typography
                variant="title"
                weight="bold"
                color={profileTheme.colors.brand.text}
                numberOfLines={1}
              >
                {recommendation.nickname}
              </Typography>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: profileTheme.colors.text.soft },
                ]}
              />
              <Typography
                variant="body2"
                color={profileTheme.colors.text.soft}
                numberOfLines={1}
                style={styles.profileMeta}
              >
                Lv. {recommendation.level} · {recommendation.job}
              </Typography>
            </View>
            <Button
              accessibilityLabel={`${recommendation.nickname}에게 친구 요청`}
              title={isRequested ? '요청 완료' : '친구 요청'}
              variant="ghost"
              size="md"
              onPress={handleRequestFriend}
              backgroundColor={profileTheme.colors.brand.text}
              textColor={palette.white}
              loading={addFriendMutation.isPending}
              disabled={isRequested}
              style={styles.requestButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default RandomFriendRecommendation;

const styles = StyleSheet.create((theme) => ({
  section: {
    marginTop: theme.foundation.spacing[5],
    gap: theme.foundation.spacing[3],
  },
  card: {
    position: 'relative',
    height: CARD_HEIGHT,
    borderRadius: theme.foundation.radii.m,
    overflow: 'hidden',
    backgroundColor: appThemes.green.colors.brand.card,
  },
  stateCard: {
    height: CARD_HEIGHT,
    borderRadius: theme.foundation.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[4],
    paddingHorizontal: theme.foundation.spacing[6],
    backgroundColor: appThemes.green.colors.brand.card,
  },
  errorMessage: {
    lineHeight: baseFoundation.dimension.x22,
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    position: 'absolute',
    top: theme.foundation.spacing[7],
    zIndex: 2,
  },
  characterStage: {
    position: 'absolute',
    left: theme.foundation.spacing[0],
    right: theme.foundation.spacing[0],
    bottom: theme.foundation.spacing[16],
    alignItems: 'center',
  },
  characterImage: {
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
  },
  profile: {
    position: 'absolute',
    left: theme.foundation.spacing[4],
    right: theme.foundation.spacing[4],
    bottom: theme.foundation.spacing[4],
    height: PROFILE_HEIGHT,
    borderRadius: theme.foundation.radii.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.foundation.spacing[4],
    paddingRight: theme.foundation.spacing[2],
  },
  identity: {
    minWidth: baseFoundation.dimension.x0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: baseFoundation.dimension.x1,
    height: baseFoundation.dimension.x24,
    marginHorizontal: theme.foundation.spacing[3],
    opacity: baseFoundation.opacity.disabled,
  },
  profileMeta: {
    minWidth: baseFoundation.dimension.x0,
    flexShrink: 1,
  },
  requestButton: {
    width: baseFoundation.dimension.x112,
    borderRadius: theme.foundation.radii.xs,
  },
}));
