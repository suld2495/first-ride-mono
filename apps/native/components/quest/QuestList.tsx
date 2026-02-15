import { FlatList, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Quest } from '@repo/types';

import { EmptyState } from '../common/EmptyState';
import { PixelCard } from '../common/PixelCard';
import { PixelText } from '../common/PixelText';
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
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
    >
      <PixelCard style={styles.card}>
        {/* Type Badge */}
        <ThemeView style={styles.headerRow} transparent>
          <ThemeView style={styles.badge}>
            <PixelText
              variant="label"
              color={theme.colors.action.secondary.label}
              style={styles.badgeText}
            >
              {QUEST_LABEL[questType]}
            </PixelText>
          </ThemeView>
          <QuestTime endDate={new Date(endDate)} />
        </ThemeView>

        {/* Quest Name */}
        <PixelText variant="body" style={styles.questName}>
          {questName}
        </PixelText>

        {/* GOAL Section */}
        <ThemeView style={styles.goalSection} transparent>
          <ThemeView style={styles.goalIcon} transparent>
            <Ionicons
              name="flag-outline"
              size={14}
              color={theme.colors.text.secondary}
            />
          </ThemeView>
          <Typography variant="label" style={styles.goalText}>
            {description}
          </Typography>
        </ThemeView>
      </PixelCard>
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
        <EmptyState
          icon="briefcase-outline"
          message="퀘스트가 존재하지 않습니다."
        />
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
    // paddingHorizontal removed to fix double padding
    paddingTop: theme.foundation.spacing.m,
    paddingBottom: theme.foundation.spacing.xl,
    gap: theme.foundation.spacing.m,
    flexGrow: 1,
  },

  card: {
    padding: theme.foundation.spacing.m,
    marginVertical: 0,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.foundation.spacing.s,
  },

  badge: {
    backgroundColor: theme.colors.action.secondary.default,
    paddingHorizontal: theme.foundation.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.foundation.radii.s,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  questName: {
    fontWeight: 'bold',
    marginBottom: theme.foundation.spacing.m,
  },

  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing.s, // Restored to s for better breathing room
    // backgroundColor removed
    // padding removed or reduced
    marginTop: theme.foundation.spacing.s,
  },

  goalIcon: {
    marginTop: 0,
  },

  goalText: {
    flex: 1,
    color: theme.colors.text.tertiary,
    fontSize: 12,
    lineHeight: 18, // Increased for better readability
  },
}));
