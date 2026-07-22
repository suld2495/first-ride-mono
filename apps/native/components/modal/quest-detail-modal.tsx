import { useFetchQuestDetailQuery } from '@repo/shared/hooks/useQuest';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useQuestAction } from '@/hooks/useQuestAction';
import { useQuestId } from '@/hooks/useQuestSelection';
import { baseFoundation } from '@/theme/tokens';

const getProgressPercent = (current: number, target: number) => {
  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `기간 ${startMonth}-${startDay} ~ ${endDay}`;
  }

  return `기간 ${startMonth}-${startDay} ~ ${endMonth}-${endDay}`;
};

const getQuestStatusLabel = ({
  isAccepted,
  isCompleted,
  isExpired,
}: {
  isAccepted: boolean;
  isCompleted: boolean;
  isExpired: boolean;
}) => {
  if (isCompleted) {
    return '완료';
  }

  if (isExpired) {
    return '만료';
  }

  if (isAccepted) {
    return '진행 중';
  }

  return '참여 가능';
};

const QuestDetailModal = () => {
  const questId = useQuestId();
  const user = useAuthUser();
  const { data: detail, isLoading } = useFetchQuestDetailQuery(
    user?.userId ?? '',
    questId || 0,
  );
  const { handleQuestAction, isPending } = useQuestAction({
    questId,
    isAccepted: detail?.isAccepted ?? false,
    isCompleted: detail?.isCompleted ?? false,
  });

  if (isLoading || !detail) {
    return null;
  }

  const {
    questName,
    currentParticipants,
    maxParticipants,
    startDate,
    endDate,
    rewardType,
    expAmount,
    isAccepted,
    isCompleted,
    successCount,
    verificationTargetCount,
  } = detail;

  const isFull = currentParticipants === maxParticipants;
  const isExpired = new Date(endDate).getTime() < Date.now();
  const currentCount = successCount ?? 0;
  const targetCount = Math.max(verificationTargetCount ?? 1, 1);
  const hasAchievedGoal = currentCount >= targetCount;
  const isRewardUnavailable = isAccepted && !hasAchievedGoal;
  const isActionDisabled =
    isExpired || isCompleted || isFull || isPending || isRewardUnavailable;
  const progressPercent = getProgressPercent(currentCount, targetCount);
  const rewardButtonBackgroundColor = isActionDisabled
    ? styles.rewardButtonDisabled.backgroundColor
    : '#FFFFFF';
  const rewardButtonTextColor = isActionDisabled
    ? styles.rewardButtonDisabledText.color
    : styles.rewardButtonText.color;

  return (
    <ThemeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView style={styles.cardOuter} testID="quest-detail-card-outer">
          <ThemeView style={styles.cardInner} testID="quest-detail-card-inner">
            <ThemeView
              style={styles.contentStack}
              testID="quest-detail-content"
              transparent
            >
              <ThemeView
                style={styles.statusBadge}
                testID="quest-detail-status-badge"
                transparent
              >
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={styles.statusBadgeText}
                >
                  {getQuestStatusLabel({ isAccepted, isCompleted, isExpired })}
                </Typography>
              </ThemeView>

              <Typography
                variant="subtitle2"
                weight="semibold"
                style={styles.questName}
              >
                {questName}
              </Typography>

              <ThemeView
                style={styles.progressRow}
                testID="quest-detail-progress-row"
                transparent
              >
                <View
                  style={styles.progressTrack}
                  testID="quest-detail-progress-track"
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercent}%` },
                    ]}
                    testID="quest-detail-progress-fill"
                  />
                </View>
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={styles.progressValue}
                >
                  {currentCount}/{targetCount}
                </Typography>
              </ThemeView>

              <ThemeView
                style={styles.imagePlaceholder}
                testID="quest-detail-image-placeholder"
              />

              <ThemeView
                style={styles.periodBadge}
                testID="quest-detail-period-badge"
              >
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={styles.periodText}
                >
                  {formatDateRange(startDate, endDate)}
                </Typography>
              </ThemeView>

              {rewardType === 'EXP' && (
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={styles.expRewardText}
                >
                  EXP +{expAmount}
                </Typography>
              )}
            </ThemeView>

            <ThemeView
              style={styles.rewardButtonWrapper}
              testID="quest-detail-reward-button-wrapper"
              transparent
            >
              <Button
                title="보상 받기"
                testID="quest-detail-reward-button"
                onPress={handleQuestAction}
                disabled={isActionDisabled}
                backgroundColor={rewardButtonBackgroundColor}
                textColor={rewardButtonTextColor}
                textStyle={styles.rewardButtonTextBase}
                style={[
                  styles.acceptButton,
                  isActionDisabled && styles.acceptButtonDisabled,
                ]}
              />
            </ThemeView>
          </ThemeView>
        </ThemeView>
      </ScrollView>
    </ThemeView>
  );
};

export default QuestDetailModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.base, // Ensure background is set
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: theme.foundation.spacing[6],
  },

  cardOuter: {
    flex: 1,
    borderColor: theme.colors.brand.text,
    borderWidth: 2,
    borderRadius: baseFoundation.dimension.x14,
    backgroundColor: '#FFFFFF',
    padding: baseFoundation.dimension.x2,
  },

  cardInner: {
    flex: 1,
    justifyContent: 'space-between',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    borderRadius: baseFoundation.dimension.x12,
    backgroundColor: theme.colors.brand.text,
    paddingTop: 0,
    paddingHorizontal: 17,
    paddingBottom: 0,
  },

  contentStack: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 33,
    paddingBottom: theme.foundation.spacing[6],
  },

  statusBadge: {
    height: 17,
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
    borderRadius: baseFoundation.dimension.x4,
    backgroundColor: 'transparent',
    paddingHorizontal: baseFoundation.dimension.x3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadgeText: {
    color: theme.colors.brand.primary,
  },

  questName: {
    color: '#FFFFFF',
    marginTop: baseFoundation.dimension.x14,
    textAlign: 'center',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.dimension.x8,
    marginTop: baseFoundation.dimension.x36,
  },

  progressTrack: {
    width: 115,
    height: baseFoundation.dimension.x8,
    borderRadius: 999,
    backgroundColor: theme.colors.text.muted,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.brand.primary,
  },

  progressValue: {
    color: theme.colors.brand.background ?? '#FFFFFF',
  },

  imagePlaceholder: {
    width: 140,
    height: 140,
    marginTop: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.dimension.x12,
    backgroundColor: theme.colors.brand.background ?? '#FFFFFF',
  },

  periodBadge: {
    height: 24,
    marginTop: baseFoundation.dimension.x32,
    borderRadius: baseFoundation.dimension.x8,
    backgroundColor: theme.colors.questDetail.periodBackground,
    paddingHorizontal: baseFoundation.dimension.x8,
    paddingVertical: baseFoundation.dimension.x4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  periodText: {
    color: theme.colors.questDetail.periodText,
  },

  rewardButtonWrapper: {
    width: '100%',
    marginBottom: 33,
    paddingHorizontal: 21,
  },

  expRewardText: {
    color: '#FFFFFF',
    marginTop: baseFoundation.dimension.x8,
  },

  acceptButton: {
    width: '100%',
    height: 36,
    borderRadius: baseFoundation.dimension.x6,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  acceptButtonDisabled: {
    opacity: 1,
  },

  rewardButtonTextBase: {
    fontSize: baseFoundation.typography.size.body2,
    fontWeight: baseFoundation.typography.weight.semibold,
  },

  rewardButtonText: {
    color: theme.colors.text.gray,
  },

  rewardButtonDisabled: {
    backgroundColor: theme.colors.text.muted,
  },

  rewardButtonDisabledText: {
    color: theme.colors.text.soft,
  },
}));
