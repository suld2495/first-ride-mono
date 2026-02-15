import { ScrollView } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useAccpetQuestMutation,
  useFetchQuestDetailQuery,
} from '@repo/shared/hooks/useQuest';
import { useRouter } from 'expo-router';

import { useToast } from '@/contexts/ToastContext';
import { useQuestStore } from '@/store/quest.store';
import { getApiErrorMessage } from '@/utils/error-utils';

import { Button } from '../common/Button';
import { PixelText } from '../common/PixelText';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';
import QuestInfo from '../quest/QuestInfo';
import QuestRewards from '../quest/QuestRewards';
import QuestTime from '../quest/QuestTime';

const QUEST_LABEL: Record<string, string> = {
  DAILY: '일일 퀘스트',
  WEEKLY: '주간 퀘스트',
};

const QuestDetailModal = () => {
  const { theme } = useUnistyles();
  const router = useRouter();
  const questId = useQuestStore((state) => state.questId);
  const { showToast } = useToast();

  const { data: detail, isLoading } = useFetchQuestDetailQuery(questId || 0);
  const acceptQuest = useAccpetQuestMutation();

  if (isLoading || !detail) {
    return null;
  }

  const {
    questType,
    questName,
    description,
    requiredLevel,
    currentParticipants,
    maxParticipants,
    rewardName,
    rewardType,
    endDate,
    isAccepted,
  } = detail;

  const isFull = currentParticipants === maxParticipants;

  const handleAcceptQuest = async () => {
    if (!questId) return;

    try {
      await acceptQuest.mutateAsync(questId);
      showToast('수락되었습니다.', 'success');
      router.back();
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        '이미 수락한 퀘스트입니다.',
      );

      showToast(errorMessage, 'error');
    }
  };

  return (
    <ThemeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <ThemeView style={styles.headerSection}>
          {/* Type Badge */}
          <ThemeView style={styles.badgeContainer}>
            <PixelText
              variant="label"
              color={theme.colors.action.secondary.label}
              style={styles.badgeText}
            >
              {QUEST_LABEL[questType]}
            </PixelText>
          </ThemeView>

          {/* Quest Name */}
          <PixelText variant="title" style={styles.questName}>
            {questName}
          </PixelText>

          {/* GOAL Section */}
          <ThemeView style={styles.goalSection}>
            <Ionicons
              name="flag-outline"
              size={20}
              color={theme.colors.text.secondary}
            />
            <Typography variant="body" style={styles.goalText}>
              {description}
            </Typography>
          </ThemeView>
        </ThemeView>

        {/* Quest Info */}
        <QuestInfo
          requiredLevel={requiredLevel}
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
        />

        {/* Rewards */}
        <QuestRewards rewardName={rewardName} rewardType={rewardType} />

        {/* Time */}
        <QuestTime endDate={new Date(endDate)} />

        {/* Accept Button */}
        <Button
          title={
            isAccepted ? '참여중' : isFull ? '참여불가 (정원 초과)' : '참여'
          }
          onPress={handleAcceptQuest}
          disabled={isAccepted || isFull || acceptQuest.isPending}
          style={[
            styles.acceptButton,
            (isAccepted || isFull) && styles.acceptButtonDisabled,
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
    padding: theme.foundation.spacing.m,
    gap: theme.foundation.spacing.m,
  },

  headerSection: {
    alignItems: 'center',
    gap: theme.foundation.spacing.m,
    marginBottom: theme.foundation.spacing.l,
  },

  badgeContainer: {
    backgroundColor: theme.colors.action.secondary.default,
    paddingHorizontal: theme.foundation.spacing.m,
    paddingVertical: 4,
    borderRadius: theme.foundation.radii.l,
  },

  badgeText: {
    fontWeight: 'bold',
  },

  questName: {
    textAlign: 'center',
    marginBottom: theme.foundation.spacing.s,
  },

  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing.s,
    backgroundColor: theme.colors.background.sunken,
    padding: theme.foundation.spacing.m,
    borderRadius: theme.foundation.radii.m,
    width: '100%',
  },

  goalText: {
    flex: 1,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },

  acceptButton: {
    marginTop: theme.foundation.spacing.m,
  },

  acceptButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.text.tertiary, // Fallback to tertiary
  },
}));
