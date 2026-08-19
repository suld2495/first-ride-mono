import {
  useConfirmationImageVisibilityQuery,
  useRandomFriendRecommendationSettingsQuery,
  useUpdateConfirmationImageVisibilityMutation,
  useUpdateRandomFriendRecommendationSettingsMutation,
} from '@repo/shared/hooks/useFriend';
import { Pressable, ScrollView, View } from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import NotificationSwitch from '@/components/notification/notification-switch';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const RANDOM_FRIEND_SETTINGS_ERROR_MESSAGE =
  '친구 추천 설정을 변경하지 못했습니다.';
const CONFIRMATION_IMAGE_VISIBILITY_ERROR_MESSAGE =
  '친구 인증 사진 공개 설정을 변경하지 못했습니다.';

type VisibilitySettingSectionProps = {
  accessibilityLabel: string;
  description: string;
  errorMessage: string;
  isError: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onRetry: () => void;
  onToggle: (value: boolean) => void;
  testID: string;
  toggleTestID: string;
  title: string;
  value: boolean;
};

function VisibilitySettingSection({
  accessibilityLabel,
  description,
  errorMessage,
  isError,
  isLoading,
  isSaving,
  onRetry,
  onToggle,
  testID,
  toggleTestID,
  title,
  value,
}: VisibilitySettingSectionProps) {
  const isDisabled = isLoading || isError || isSaving;

  return (
    <View style={styles.section} testID={testID}>
      <View style={styles.primaryRow}>
        <View style={styles.rowText}>
          <Typography variant="body1" weight="semibold">
            {title}
          </Typography>
          <Typography
            color="secondary"
            style={styles.description}
            variant="caption1"
          >
            {description}
          </Typography>
        </View>
        <NotificationSwitch
          accessibilityLabel={accessibilityLabel}
          disabled={isDisabled}
          onValueChange={onToggle}
          testID={toggleTestID}
          value={value}
        />
      </View>
      {isLoading ? (
        <Typography color="secondary" variant="caption1">
          설정을 불러오는 중입니다.
        </Typography>
      ) : null}
      {isError ? (
        <View style={styles.notice}>
          <Typography color="secondary" variant="caption1">
            {errorMessage}
          </Typography>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.retryButton}
          >
            <Typography color="inverse" variant="body3" weight="semibold">
              다시 시도
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function VisibilitySettingsPage() {
  const { showToast } = useToast();
  const user = useAuthUser();
  const {
    data: randomFriendRecommendationSettings,
    isError: isRandomFriendRecommendationError,
    isLoading: isRandomFriendRecommendationLoading,
    refetch: refetchRandomFriendRecommendationSettings,
  } = useRandomFriendRecommendationSettingsQuery(user?.userId ?? '');
  const {
    data: confirmationImageVisibility,
    isError: isConfirmationImageVisibilityError,
    isLoading: isConfirmationImageVisibilityLoading,
    refetch: refetchConfirmationImageVisibility,
  } = useConfirmationImageVisibilityQuery(user?.userId ?? '');
  const updateRandomFriendRecommendationSettings =
    useUpdateRandomFriendRecommendationSettingsMutation(user?.userId ?? '');
  const updateConfirmationImageVisibility =
    useUpdateConfirmationImageVisibilityMutation(user?.userId ?? '');

  const handleToggleRandomFriendRecommendationOptOut = (
    shouldOptOut: boolean,
  ) => {
    updateRandomFriendRecommendationSettings.mutate(!shouldOptOut, {
      onError: (error) => {
        showToast(
          getApiErrorMessage(error, RANDOM_FRIEND_SETTINGS_ERROR_MESSAGE),
          'error',
        );
      },
    });
  };

  const handleToggleConfirmationImageVisibility = (visible: boolean) => {
    updateConfirmationImageVisibility.mutate(visible, {
      onError: (error) => {
        showToast(
          getApiErrorMessage(
            error,
            CONFIRMATION_IMAGE_VISIBILITY_ERROR_MESSAGE,
          ),
          'error',
        );
      },
    });
  };

  return (
    <Container noPadding style={styles.container}>
      <PageHeader title="공개 설정" showBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Typography variant="h3" weight="bold" style={styles.introTitle}>
            친구에게 보여지는 범위를 관리해 주세요
          </Typography>
          <Typography variant="body2" style={styles.introDescription}>
            친구 추천과 인증 사진 공개 여부를 선택할 수 있어요.
          </Typography>
        </View>
        <VisibilitySettingSection
          accessibilityLabel="친구 추천 안 하기"
          description="다른 사람의 랜덤 친구 추천 목록에 내 프로필을 노출하지 않습니다."
          errorMessage="친구 추천 설정을 불러오지 못했습니다."
          isError={isRandomFriendRecommendationError}
          isLoading={isRandomFriendRecommendationLoading}
          isSaving={updateRandomFriendRecommendationSettings.isPending}
          onRetry={() => {
            void refetchRandomFriendRecommendationSettings();
          }}
          onToggle={handleToggleRandomFriendRecommendationOptOut}
          testID="visibility-settings-random-friend-section"
          toggleTestID="visibility-settings-toggle-random-friend-opt-out"
          title="친구 추천 안 하기"
          value={
            !(
              randomFriendRecommendationSettings?.randomFriendRecommendationEnabled ??
              true
            )
          }
        />
        <VisibilitySettingSection
          accessibilityLabel="친구에게 인증 사진 공개"
          description="친구가 내 루틴을 볼 때 승인된 인증 사진을 공개합니다."
          errorMessage="친구 인증 사진 공개 설정을 불러오지 못했습니다."
          isError={isConfirmationImageVisibilityError}
          isLoading={isConfirmationImageVisibilityLoading}
          isSaving={updateConfirmationImageVisibility.isPending}
          onRetry={() => {
            void refetchConfirmationImageVisibility();
          }}
          onToggle={handleToggleConfirmationImageVisibility}
          testID="visibility-settings-confirmation-image-section"
          toggleTestID="visibility-settings-toggle-confirmation-image-visibility"
          title="친구에게 인증 사진 공개"
          value={
            confirmationImageVisibility?.confirmationImagesVisibleToFriends ??
            false
          }
        />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.base,
  },
  content: {
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: baseFoundation.dimension.x96,
    gap: theme.foundation.spacing[4],
  },
  intro: {
    gap: theme.foundation.spacing[2],
    paddingBottom: theme.foundation.spacing[2],
  },
  introTitle: {
    color: theme.colors.brand.text,
  },
  introDescription: {
    color: theme.colors.text.muted,
  },
  section: {
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[2],
  },
  primaryRow: {
    minHeight: baseFoundation.dimension.x72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[4],
  },
  rowText: {
    flex: 1,
  },
  description: {
    marginTop: theme.foundation.spacing[1],
  },
  notice: {
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
    paddingVertical: theme.foundation.spacing[3],
  },
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: baseFoundation.dimension.x40,
    paddingHorizontal: theme.foundation.spacing[4],
    borderRadius: theme.foundation.radii.s,
    backgroundColor: theme.colors.action.primary.default,
  },
}));
