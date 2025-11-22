import { ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Quest } from '@repo/types';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

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
  const { questType, questName, description, endDate } = quest;

  return (
    <Button
      variant="plain"
      onPress={() => onClick(quest)}
      style={({ pressed }) => [
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
          <ThemeText
            variant="medium"
            lightColor="#e0f2fe"
            darkColor="#e0f2fe"
            style={styles.badge}
          >
            [{QUEST_LABEL[questType]}]
          </ThemeText>
        </ThemeView>

        {/* Quest Name */}
        <ThemeText
          variant="subtitle"
          lightColor="#e0f2fe"
          darkColor="#e0f2fe"
          style={styles.questName}
        >
          {questName}
        </ThemeText>

        {/* GOAL Section */}
        <ThemeView style={styles.goalSection}>
          <ThemeText
            variant="title"
            lightColor="#1ddeff"
            darkColor="#1ddeff"
            style={styles.goalTitle}
          >
            GOAL
          </ThemeText>
          <ThemeView style={styles.goalBox}>
            <Ionicons name="checkbox-outline" size={20} color="#1ddeff" />
            <ThemeText
              variant="medium"
              lightColor="#90a1b9"
              darkColor="#90a1b9"
              style={styles.goalText}
            >
              {description}
            </ThemeText>
          </ThemeView>
        </ThemeView>

        {/* Quest Time */}
        <QuestTime endDate={new Date(endDate)} />
      </ThemeView>
    </Button>
  );
};

interface QuestListProps {
  quests: Quest[];
  onClickItem: (item: Quest) => void;
}

const QuestList = ({ quests, onClickItem }: QuestListProps) => {
  if (quests.length === 0) {
    return (
      <ThemeView style={styles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={50} color="#90a1b9" />
        <ThemeText
          variant="default"
          lightColor="#90a1b9"
          darkColor="#90a1b9"
          style={styles.emptyText}
        >
          퀘스트가 존재하지 않습니다.
        </ThemeText>
      </ThemeView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {quests.map((quest) => (
        <QuestItem key={quest.questId} quest={quest} onClick={onClickItem} />
      ))}
    </ScrollView>
  );
};

export default QuestList;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },

  questCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 2,
    borderColor: '#0891b2',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 214, 256, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },

  questCardPressed: {
    opacity: 0.8,
  },

  topLine: {
    height: 4,
    backgroundColor: '#0891b2',
  },

  cardContent: {
    padding: 16,
    gap: 16,
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  emptyText: {
    // Style applied via variant and color props
  },
});
