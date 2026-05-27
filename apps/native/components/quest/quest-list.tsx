import type { Quest } from '@repo/types';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface QuestItemProps {
  quest: Quest;
  onClick: (item: Quest) => void;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const formatRemainingDays = (endDate: string) => {
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / MS_PER_DAY);

  if (days > 0) {
    return `${days}일 남음`;
  }

  if (days === 0) {
    return '오늘 마감';
  }

  return '종료됨';
};

const getProgressPercent = (current: number, target: number) => {
  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
};

const QuestItem = ({ quest, onClick }: QuestItemProps) => {
  const {
    currentVerificationCount,
    endDate,
    questName,
    verificationTargetCount,
  } = quest;
  const currentCount = currentVerificationCount ?? 0;
  const targetCount = Math.max(verificationTargetCount ?? 1, 1);
  const progressPercent = getProgressPercent(currentCount, targetCount);

  return (
    <Pressable
      onPress={() => onClick(quest)}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
    >
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          <View style={styles.cardContent} testID="quest-card-content">
            <View
              style={styles.iconPlaceholder}
              testID="quest-icon-placeholder"
            />
            <View style={styles.contentColumn} testID="quest-content-column">
              <View style={styles.titleStack} testID="quest-text-stack">
                <Typography
                  variant="caption3"
                  weight="semibold"
                  style={styles.remainingText}
                >
                  {formatRemainingDays(endDate)}
                </Typography>
                <Typography
                  variant="body2"
                  weight="semibold"
                  style={styles.questName}
                >
                  {questName}
                </Typography>
              </View>
              <View style={styles.progressRow} testID="quest-progress-row">
                <View
                  style={styles.progressTrack}
                  testID="quest-progress-track"
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercent}%` },
                    ]}
                    testID="quest-progress-fill"
                  />
                </View>
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={styles.progressValue}
                >
                  {currentCount}/{targetCount}
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

interface QuestListProps {
  quests: Quest[];
  onClickItem: (item: Quest) => void;
}

const QUEST_ITEM_HEIGHT = 120;
const QUEST_ITEM_GAP = 8;
const getQuestItemLayout = (_: Quest[] | null, index: number) => ({
  length: QUEST_ITEM_HEIGHT,
  offset: (QUEST_ITEM_HEIGHT + QUEST_ITEM_GAP) * index,
  index,
});

const QuestItemSeparator = () => <View style={styles.itemSeparator} />;

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
      ItemSeparatorComponent={QuestItemSeparator}
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
    flexGrow: 1,
  },

  itemSeparator: {
    height: QUEST_ITEM_GAP,
  },

  cardOuter: {
    borderColor: theme.colors.brand.text,
    borderWidth: 2,
    borderRadius: baseFoundation.dimension.x14,
    backgroundColor: '#FFFFFF',
    marginVertical: baseFoundation.spacing[0],
    padding: baseFoundation.dimension.x2,
  },

  cardInner: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    borderRadius: baseFoundation.dimension.x12,
    backgroundColor: theme.colors.brand.text,
    padding: 17,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseFoundation.dimension.x12,
  },

  iconPlaceholder: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
    borderRadius: baseFoundation.dimension.x6,
    backgroundColor: '#FFFFFF',
  },

  contentColumn: {
    flex: 1,
    gap: baseFoundation.dimension.x8,
  },

  titleStack: {
    gap: baseFoundation.dimension.x6,
  },

  remainingText: {
    color: theme.colors.text.secondary,
  },

  questName: {
    color: '#FFFFFF',
    lineHeight: baseFoundation.typography.size.body2 * 1.3,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.dimension.x8,
  },

  progressTrack: {
    flex: 1,
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
}));
