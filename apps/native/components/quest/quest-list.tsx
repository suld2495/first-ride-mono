import Ionicons from '@expo/vector-icons/Ionicons';
import type { Quest } from '@repo/types';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';

import QuestTime from './quest-time';

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

const QUEST_ITEM_HEIGHT = 120;
const getQuestItemLayout = (_: Quest[] | null, index: number) => ({
  length: QUEST_ITEM_HEIGHT,
  offset: QUEST_ITEM_HEIGHT * index,
  index,
});

const QuestList = ({ quests, onClickItem }: QuestListProps) => {
  const renderQuestItem = useCallback<ListRenderItem<Quest>>(
    ({ item }) => <QuestItem quest={item} onClick={onClickItem} />,
    [onClickItem],
  );

  return (
    <FlashList
      data={quests}
      keyExtractor={(quest) => quest.questId.toString()}
      renderItem={renderQuestItem}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={QUEST_ITEM_HEIGHT}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={getQuestItemLayout}
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
