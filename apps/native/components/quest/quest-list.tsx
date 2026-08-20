import type { Quest } from '@repo/types';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation } from '@/theme/tokens';

import QuestPixelStar from './quest-pixel-star';

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

const formatQuestRound = (
  current: number,
  target: number,
  currentWeeklyStreak?: number,
) => {
  if (typeof currentWeeklyStreak === 'number') {
    return `${currentWeeklyStreak}회째`;
  }

  if (current >= target) {
    return `${target}회 완료`;
  }

  return `${current + 1}회째`;
};

const QuestItem = ({ quest, onClick }: QuestItemProps) => {
  const {
    currentWeeklyStreak,
    endDate,
    questName,
    successCount,
    verificationTargetCount,
  } = quest;
  const currentCount = successCount ?? 0;
  const targetCount = Math.max(verificationTargetCount ?? 1, 1);
  const progressPercent = getProgressPercent(currentCount, targetCount);
  const questRoundLabel = formatQuestRound(
    currentCount,
    targetCount,
    currentWeeklyStreak,
  );
  const questRoundAccessibilityLabel =
    currentCount >= targetCount
      ? questRoundLabel
      : `${questRoundLabel} 퀘스트 진행 중`;

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
            >
              <QuestPixelStar size={baseFoundation.dimension.x28} />
            </View>
            <View style={styles.contentColumn} testID="quest-content-column">
              <View style={styles.titleRow} testID="quest-title-row">
                <Typography
                  variant="body2"
                  weight="semibold"
                  style={styles.questName}
                  testID="quest-title"
                >
                  {questName}
                </Typography>
                <Typography
                  variant="caption3"
                  weight="semibold"
                  style={styles.questRound}
                  accessibilityLabel={questRoundAccessibilityLabel}
                  testID="quest-round"
                >
                  {questRoundLabel}
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
              <Typography
                variant="caption3"
                weight="semibold"
                style={styles.remainingText}
                testID="quest-remaining-days"
              >
                {formatRemainingDays(endDate)}
              </Typography>
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

  if (quests.length === 0) {
    return (
      <EmptyState
        icon="briefcase-outline"
        message="퀘스트가 존재하지 않습니다."
      />
    );
  }

  return (
    <FlashList
      data={quests}
      keyExtractor={(quest) => quest.questId.toString()}
      renderItem={renderQuestItem}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      ItemSeparatorComponent={QuestItemSeparator}
      showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={getQuestItemLayout}
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentColumn: {
    flex: 1,
    gap: baseFoundation.dimension.x8,
  },

  remainingText: {
    color: theme.colors.text.secondary,
  },

  questName: {
    flex: 1,
    color: '#FFFFFF',
    lineHeight: baseFoundation.typography.size.body2 * 1.3,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.dimension.x8,
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

  questRound: {
    color: theme.colors.brand.primary,
    flexShrink: 0,
    textAlign: 'right',
  },
}));
