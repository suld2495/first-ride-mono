import { ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useAccpetQuestMutation,
  useFetchQuestDetailQuery,
} from '@repo/shared/hooks/useQuest';
import { useRouter } from 'expo-router';

import { useQuestStore } from '@/store/quest.store';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import QuestInfo from '../quest/QuestInfo';
import QuestRewards from '../quest/QuestRewards';
import QuestTime from '../quest/QuestTime';

const QUEST_LABEL: Record<string, string> = {
  DAILY: '일일 퀘스트',
  WEEKLY: '주간 퀘스트',
};

const QuestDetailModal = () => {
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
        <View style={styles.headerSection}>
          {/* Type Badge */}
          <ThemeText
            variant="medium"
            lightColor="#e0f2fe"
            darkColor="#e0f2fe"
            style={styles.badge}
          >
            [{QUEST_LABEL[questType]}]
          </ThemeText>

          {/* Quest Name */}
          <ThemeText
            variant="title"
            lightColor="#e0f2fe"
            darkColor="#e0f2fe"
            style={styles.questName}
          >
            {questName}
          </ThemeText>

          {/* GOAL Section */}
          <View style={styles.goalSection}>
            <ThemeText
              variant="title"
              lightColor="#1ddeff"
              darkColor="#1ddeff"
              style={styles.goalTitle}
            >
              GOAL
            </ThemeText>
            <View style={styles.goalBox}>
              <Ionicons name="checkbox-outline" size={20} color="#1ddeff" />
              <ThemeText
                variant="medium"
                lightColor="#90a1b9"
                darkColor="#90a1b9"
                style={styles.goalText}
              >
                {description}
              </ThemeText>
            </View>
          </View>
        </View>

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
          title={isFull ? '참여불가 (정원 초과)' : '참여'}
          onPress={handleAcceptQuest}
          disabled={isFull || acceptQuest.isPending}
          style={[styles.acceptButton, isFull && styles.acceptButtonDisabled]}
        />
      </ScrollView>
    </ThemeView>
  );
};

export default QuestDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    gap: 16,
  },

  headerSection: {
    gap: 16,
  },

  badge: {
    fontWeight: 'bold',
  },

  questName: {
    fontWeight: '600',
  },

  goalSection: {
    gap: 12,
  },

  goalTitle: {
    textAlign: 'center',
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 214, 256, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },

  goalBox: {
    flexDirection: 'row',
    gap: 8,
    borderColor: '#0891b2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'flex-start',
  },

  goalText: {
    flex: 1,
  },

  acceptButton: {
    backgroundColor: '#0891b2',
  },

  acceptButtonDisabled: {
    backgroundColor: '#90a1b9',
    opacity: 0.35,
  },
});
