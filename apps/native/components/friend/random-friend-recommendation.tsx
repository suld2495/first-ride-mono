import {
  useAddFriendMutation,
  useRandomFriendRecommendationQuery,
} from '@repo/shared/hooks/useFriend';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useRef, useState } from 'react';
import { Switch, View } from 'react-native';

import {
  getRoutineSceneBackgroundAsset,
  getRoutineSceneCharacterAsset,
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import CharacterSpeechBubble from '@/feature/character/character-speech-bubble';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useRandomFriendRecommendationRollover } from '@/hooks/useRandomFriendRecommendationRollover';
import { useRandomFriendRecommendationPreference } from '@/hooks/useRandomFriendRecommendationPreference';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { appThemes } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';
import { formatCountdown } from '@/utils/random-friend-recommendation-timer';

const CARD_HEIGHT = baseFoundation.dimension.x250;
const CHARACTER_SIZE = baseFoundation.dimension.x140;
const PROFILE_HEIGHT = baseFoundation.dimension.x52;
const FRIEND_REQUEST_ERROR_MESSAGE =
  '친구 요청을 보내지 못했습니다. 다시 시도해주세요.';
const RECOMMENDATION_ERROR_MESSAGE =
  '추천 친구를 불러오지 못했습니다.\n잠시 후 다시 시도해주세요.';

interface RandomFriendRecommendationHeaderProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  refetch: () => unknown;
}

const RandomFriendRecommendationCountdown = ({
  refetch,
}: Pick<RandomFriendRecommendationHeaderProps, 'refetch'>) => {
  const { theme } = useAppTheme();
  const remainingSeconds = useRandomFriendRecommendationRollover(refetch);

  return (
    <View style={styles.countdownRow} testID="random-friend-countdown-row">
      <View
        style={styles.countdownContainer}
        testID="random-friend-countdown-container"
      >
        <Ionicons
          name="time-outline"
          size={baseFoundation.typography.size.caption1}
          color={theme.colors.text.muted}
          testID="random-friend-countdown-icon"
        />
        <Typography
          variant="caption1"
          weight="medium"
          style={styles.countdown}
          testID="random-friend-countdown"
        >
          {formatCountdown(remainingSeconds)}
        </Typography>
      </View>
    </View>
  );
};

const RandomFriendRecommendationHeader = ({
  enabled,
  onEnabledChange,
  refetch,
}: RandomFriendRecommendationHeaderProps) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.recommendationHeader}>
      <View
        style={styles.sectionHeader}
        testID="random-friend-recommendation-header-row"
      >
        <Typography
          variant="body2"
          weight="semibold"
          style={styles.sectionTitle}
        >
          랜덤 친구 추천
        </Typography>
        <Switch
          accessibilityLabel="랜덤 친구 추천 받기"
          accessibilityState={{ checked: enabled }}
          ios_backgroundColor={theme.colors.border.strong}
          onValueChange={onEnabledChange}
          thumbColor={theme.colors.background.elevated}
          trackColor={{
            false: theme.colors.border.strong,
            true: theme.colors.text.muted,
          }}
          value={enabled}
        />
      </View>
      {enabled ? (
        <RandomFriendRecommendationCountdown refetch={refetch} />
      ) : null}
    </View>
  );
};

const RandomFriendRecommendation = () => {
  const {
    data: recommendation,
    error,
    isLoading,
    refetch,
  } = useRandomFriendRecommendationQuery();
  const addFriendMutation = useAddFriendMutation();
  const { showToast } = useToast();
  const user = useAuthUser();
  const requestInFlightRef = useRef(false);
  const {
    isEnabled: isRecommendationEnabled,
    setEnabled: setRecommendationEnabled,
  } = useRandomFriendRecommendationPreference(user?.userId);
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

  const handleRecommendationEnabledChange = (enabled: boolean) => {
    setRecommendationEnabled(enabled);

    if (enabled) {
      void refetch();
    }
  };

  const errorMessage = error
    ? getApiErrorMessage(error, RECOMMENDATION_ERROR_MESSAGE)
    : RECOMMENDATION_ERROR_MESSAGE;

  return (
    <View style={styles.section} testID="random-friend-recommendation">
      <RandomFriendRecommendationHeader
        enabled={isRecommendationEnabled}
        onEnabledChange={handleRecommendationEnabledChange}
        refetch={refetch}
      />

      {!isRecommendationEnabled ? null : isLoading ? (
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
            accessibilityRole="button"
            title="다시 시도"
            variant="ghost"
            size="sm"
            onPress={handleRetry}
            backgroundColor={appThemes.green.colors.brand.text}
            textColor={appThemes.green.colors.action.primary.label}
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
              containerMinWidth={baseFoundation.dimension.x120}
              maxWidth={baseFoundation.dimension.x180}
              message={recommendation.motto.trim()}
              numberOfLines={2}
              style={styles.speechBubble}
              testID="random-friend-speech-bubble"
              textVariant="body3"
              themeName={profileThemeName}
            />
          ) : null}

          <View
            style={styles.characterStage}
            pointerEvents="none"
            testID="random-friend-character-stage"
          >
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
            <View style={styles.identity} testID="random-friend-identity">
              <Typography
                variant="body2"
                weight="semibold"
                color={profileTheme.colors.brand.text}
              >
                {recommendation.nickname}
              </Typography>
              <Typography
                variant="body3"
                color={profileTheme.colors.text.soft}
                numberOfLines={1}
                style={styles.profileMeta}
              >
                Lv. {recommendation.level} · {recommendation.job}
              </Typography>
            </View>
            <Button
              accessibilityLabel={
                isRequested
                  ? `${recommendation.nickname}에게 친구 요청 완료`
                  : `${recommendation.nickname}에게 친구 요청`
              }
              accessibilityRole="button"
              variant="ghost"
              size="md"
              leftIcon={({ color }) => (
                <Ionicons
                  color={color}
                  name={isRequested ? 'checkmark' : 'person-add'}
                  size={baseFoundation.iconSize.m}
                  testID="random-friend-request-icon"
                />
              )}
              onPress={handleRequestFriend}
              backgroundColor={profileTheme.colors.brand.text}
              textColor={profileTheme.colors.action.primary.label}
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
    marginTop: theme.foundation.spacing[4],
    gap: theme.foundation.spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[2],
  },
  recommendationHeader: {
    gap: theme.foundation.spacing[2],
  },
  sectionTitle: {
    color: theme.colors.text.muted,
    flexShrink: 1,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: baseFoundation.dimension.x24,
    gap: theme.foundation.spacing[1],
    borderRadius: theme.foundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  countdownRow: {
    alignItems: 'flex-end',
  },
  countdown: {
    color: theme.colors.text.muted,
    flexShrink: 0,
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
    top: theme.foundation.spacing[5],
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
    left: theme.foundation.spacing[3],
    right: theme.foundation.spacing[3],
    bottom: theme.foundation.spacing[3],
    height: PROFILE_HEIGHT,
    borderRadius: theme.foundation.radii.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[2],
    paddingLeft: theme.foundation.spacing[3],
    paddingRight: theme.foundation.spacing[2],
  },
  identity: {
    minWidth: baseFoundation.dimension.x0,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  profileMeta: {
    minWidth: baseFoundation.dimension.x0,
    flexShrink: 1,
  },
  requestButton: {
    width: baseFoundation.dimension.x44,
    height: baseFoundation.dimension.x44,
    paddingHorizontal: baseFoundation.spacing[0],
    borderRadius: theme.foundation.radii.xs,
  },
}));
