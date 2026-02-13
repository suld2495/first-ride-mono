import { FlatList, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Quest } from '@repo/types';

import EmptyState from '../common/EmptyState';
import PixelText from '../common/PixelText';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

import QuestTime from './QuestTime';

const QUEST_LABEL: Record<Quest['questType'], string> = {
  DAILY: '일일 퀘스트',
  WEEKLY: '주간 퀘스트',
};

interface QuestItemProps {
  quest: Quest;
  onClick: (item: Quest) => void;
}

const QuestItem = ({ quest, onClick }: QuestItemProps) => {
  const { theme } = useUnistyles();
  const { questType, questName, description, endDate } = quest;

  return (
    <Pressable
      onPress={() => onClick(quest)}
      style={({ pressed }: { pressed: boolean }) => [
        styles.questCard,
        pressed && styles.questCardPressed,
      ]}
    >
      {/* Top Line */}
      <ThemeView style={styles.topLine} />

      {/* Card Content */}
      <ThemeView style={styles.cardContent}>
        {/* Type Badge */}
        <ThemeView style={styles.badgeSection}>
          <PixelText variant="label" style={styles.badge}>
            [{QUEST_LABEL[questType]}]
          </PixelText>
        </ThemeView>

        {/* Quest Name */}
        <PixelText variant="subtitle" style={styles.questName}>
          {questName}
        </PixelText>

        {/* GOAL Section */}
        <ThemeView style={styles.goalSection}>
          <PixelText variant="subtitle" style={styles.goalTitle}>
            GOAL
          </PixelText>
          <ThemeView style={styles.goalBox}>
            <Ionicons name="checkbox-outline" size={20} color={theme.colors.action.primary.default} />
            <Typography variant="body" style={styles.goalText}>
              {description}
            </Typography>
          </ThemeView>
        </ThemeView>

        {/* Quest Time */}
        <QuestTime endDate={new Date(endDate)} />
      </ThemeView>
    </Pressable>
  );
};

interface QuestListProps {
  quests: Quest[];
  onClickItem: (item: Quest) => void;
}

const QuestList = ({ quests, onClickItem }: QuestListProps) => {
  return (
    <FlatList
      data={quests}
      keyExtractor={(quest) => quest.questId.toString()}
      renderItem={({ item }) => (
        <QuestItem quest={item} onClick={onClickItem} />
      )}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="briefcase-outline" message="퀘스트가 존재하지 않습니다." />
      }
    />
  );
};

export default QuestList;

const styles = StyleSheet.create((theme) => ({
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: theme.foundation.spacing.m,
    paddingTop: theme.foundation.spacing.m,
    paddingBottom: theme.foundation.spacing.xl,
    gap: theme.foundation.spacing.m,
    flexGrow: 1,
  },

  questCard: {
    backgroundColor: theme.colors.background.surface,
    borderWidth: 2,
    borderColor: theme.colors.action.primary.default,
    borderRadius: 4,
    overflow: 'hidden',
    ...theme.foundation.shadow.m,
  },

  questCardPressed: {
    opacity: 0.8,
  },

  topLine: {
    height: 4,
    backgroundColor: theme.colors.action.primary.default,
  },

  cardContent: {
    padding: theme.foundation.spacing.m,
    gap: theme.foundation.spacing.m,
  },

  badgeSection: {
    marginBottom: 0,
  },

  badge: {
    fontWeight: 'bold',
  },

  questName: {
    fontWeight: '600',
    marginBottom: 8,
  },

  goalSection: {
    gap: theme.foundation.spacing.s,
  },

  goalTitle: {
    textAlign: 'center',
    letterSpacing: 6,
  },

  goalBox: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.s,
    borderColor: theme.colors.action.primary.default,
    borderWidth: 1,
    padding: theme.foundation.spacing.s,
    borderRadius: 2,
    alignItems: 'flex-start',
  },

  goalText: {
    flex: 1,
  },

}));
