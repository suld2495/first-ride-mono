import { useFetchQuestDetailQuery } from '@repo/shared/hooks/useQuest';
import { ScrollView } from 'react-native';

import QuestInfo from '@/components/quest/quest-info';
import QuestRewards from '@/components/quest/quest-rewards';
import QuestTime from '@/components/quest/quest-time';
import { Button } from '@/components/ui/button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useQuestAction } from '@/hooks/useQuestAction';
import { useQuestId } from '@/hooks/useQuestSelection';
import { baseFoundation } from '@/theme/tokens';

const QUEST_LABEL: Record<string, string> = {
  DAILY: '일일 퀘스트',
  WEEKLY: '주간 퀘스트',
};

const QuestDetailModal = () => {
  const { theme } = useAppTheme();
  const questId = useQuestId();
  const { data: detail, isLoading } = useFetchQuestDetailQuery(questId || 0);
  const { handleQuestAction, isPending } = useQuestAction({
    questId,
    isAccepted: detail?.isAccepted ?? false,
    isCompleted: detail?.isCompleted ?? false,
  });

  if (isLoading || !detail) {
    return null;
  }

  const {
    questType,
    questName,
    currentParticipants,
    maxParticipants,
    rewardName,
    rewardType,
    endDate,
    isAccepted,
    isCompleted,
    verificationType,
    currentVerificationCount,
    verificationTargetCount,
  } = detail;

  const isFull = currentParticipants === maxParticipants;
  const isExpired = new Date(endDate).getTime() < Date.now();
  const isActionDisabled = isExpired || isCompleted || isFull || isPending;

  return (
    <ThemeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <ThemeView style={styles.headerSection}>
          {/* Type Badge */}
          <ThemeView style={styles.badgeContainer}>
            <Typography
              variant="label"
              weight="semibold"
              color={theme.colors.action.secondary.label}
              style={styles.badgeText}
            >
              {QUEST_LABEL[questType]}
            </Typography>
          </ThemeView>

          {/* Quest Name */}
          <Typography
            variant="title"
            weight="semibold"
            style={styles.questName}
          >
            {questName}
          </Typography>
        </ThemeView>

        {/* Quest Info */}
        <QuestInfo
          verificationType={verificationType}
          currentVerificationCount={currentVerificationCount ?? 0}
          verificationTargetCount={verificationTargetCount}
        />

        {/* Rewards */}
        <QuestRewards rewardName={rewardName} rewardType={rewardType} />

        {/* Time */}
        <QuestTime endDate={new Date(endDate)} />

        {/* Accept Button */}
        <Button
          title={
            isExpired
              ? '만료'
              : isCompleted
                ? '완료됨'
                : isAccepted
                  ? '완료'
                  : isFull
                    ? '참여불가 (정원 초과)'
                    : '참여'
          }
          onPress={handleQuestAction}
          disabled={isActionDisabled}
          style={[
            styles.acceptButton,
            (isExpired || isCompleted || isFull) && styles.acceptButtonDisabled,
          ]}
        />
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
    padding: theme.foundation.spacing[4],
    gap: theme.foundation.spacing[4],
  },

  headerSection: {
    alignItems: 'center',
    gap: theme.foundation.spacing[4],
    marginBottom: theme.foundation.spacing[6],
  },

  badgeContainer: {
    backgroundColor: theme.colors.action.secondary.default,
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: baseFoundation.spacing[1],
    borderRadius: theme.foundation.radii.l,
  },

  badgeText: {
    fontWeight: 'bold',
  },

  questName: {
    textAlign: 'center',
    marginBottom: theme.foundation.spacing[2],
  },
  acceptButton: {
    marginTop: theme.foundation.spacing[4],
  },

  acceptButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.text.tertiary, // Fallback to tertiary
  },
}));
