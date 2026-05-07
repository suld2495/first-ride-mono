import Ionicons from '@expo/vector-icons/Ionicons';
import type { Quest } from '@repo/types';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { PixelCard } from '@/components/ui/pixel-card';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

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
  const { theme } = useAppTheme();
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
            <Typography
              variant="label"
              weight="semibold"
              color={theme.colors.action.secondary.label}
              style={styles.badgeText}
            >
              {QUEST_LABEL[questType]}
            </Typography>
          </ThemeView>
          <QuestTime endDate={new Date(endDate)} />
        </ThemeView>

        {/* Quest Name */}
        <Typography variant="body" style={styles.questName}>
          {questName}
        </Typography>

        {/* GOAL Section */}
        <ThemeView style={styles.goalSection} transparent>
          <ThemeView style={styles.goalIcon} transparent>
            <Ionicons
              name="flag-outline"
              size={baseFoundation.dimension.x14}
              color={theme.colors.text.secondary}
            />
          </ThemeView>
          <Typography variant="label" weight="semibold" style={styles.goalText}>
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
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[8],
    gap: theme.foundation.spacing[4],
    flexGrow: 1,
  },

  card: {
    padding: theme.foundation.spacing[4],
    marginVertical: baseFoundation.spacing[0],
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.foundation.spacing[2],
  },

  badge: {
    backgroundColor: theme.colors.action.secondary.default,
    paddingHorizontal: theme.foundation.spacing[2],
    paddingVertical: baseFoundation.spacing[1],
    borderRadius: theme.foundation.radii.s,
  },

  badgeText: {
    fontSize: baseFoundation.typography.size.caption2,
    fontWeight: 'bold',
  },

  questName: {
    fontWeight: 'bold',
    marginBottom: theme.foundation.spacing[4],
  },

  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
    // backgroundColor removed
    // padding removed or reduced
    marginTop: theme.foundation.spacing[2],
  },

  goalIcon: {
    marginTop: baseFoundation.spacing[0],
  },

  goalText: {
    flex: 1,
    color: theme.colors.text.tertiary,
    fontSize: baseFoundation.typography.size.caption2,
    lineHeight: 18, // Increased for better readability
  },
}));
