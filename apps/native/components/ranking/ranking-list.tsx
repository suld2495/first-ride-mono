import type { LevelRankingEntry, StatKey, StatRankingEntry } from '@repo/types';
import { useCallback } from 'react';
import { RefreshControl, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { STAT_LABEL_BY_TYPE } from '@/constants/RANKING';
import { baseFoundation } from '@/theme/tokens';

type RankingEntry = LevelRankingEntry | StatRankingEntry;
type LooseStatRankingEntry = StatRankingEntry & {
  score?: number;
  stat?: number;
  statValue?: number;
  total?: number;
};
type RankingEntryResponse =
  | RankingEntry[]
  | {
      content?: RankingEntry[];
      items?: RankingEntry[];
      rankings?: RankingEntry[];
    };

interface RankingListProps {
  data?: RankingEntryResponse;
  errorMessage?: string;
  isLoading: boolean;
  refreshing: boolean;
  mode: 'level' | 'stat';
  statType?: StatKey;
  onRefresh: () => void;
}

const getRank = (item: RankingEntry, index: number) => item.rank ?? index + 1;

const getRankingEntries = (data: RankingListProps['data']): RankingEntry[] => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.rankings ?? data?.items ?? data?.content ?? [];
};

const getStatRankingValue = (item: LooseStatRankingEntry) =>
  item.value ?? item.statValue ?? item.score ?? item.stat ?? item.total ?? 0;

const getEntryValue = (
  item: RankingEntry,
  mode: RankingListProps['mode'],
  selectedStatType?: StatKey,
) => {
  if (mode === 'level') {
    const levelItem = item as LevelRankingEntry;

    return {
      primary: `Lv. ${levelItem.level}`,
      secondary: `${levelItem.totalExp.toLocaleString()} EXP`,
    };
  }

  const statItem = item as LooseStatRankingEntry;
  const statType = statItem.statType ?? selectedStatType ?? 'STRENGTH';

  return {
    primary: getStatRankingValue(statItem).toLocaleString(),
    secondary: STAT_LABEL_BY_TYPE[statType],
  };
};

interface RankingItemProps {
  index: number;
  item: RankingEntry;
  mode: RankingListProps['mode'];
  statType?: StatKey;
}

const RankingItem = ({ index, item, mode, statType }: RankingItemProps) => {
  const rank = getRank(item, index);
  const value = getEntryValue(item, mode, statType);
  const isPodium = rank <= 3;

  return (
    <View style={[styles.card, isPodium ? styles.podiumCard : null]}>
      <View
        style={[styles.rankBadge, isPodium ? styles.podiumRankBadge : null]}
      >
        <Typography
          variant="body2"
          weight="bold"
          style={isPodium ? styles.podiumRankText : styles.rankText}
        >
          {rank}
        </Typography>
      </View>
      <View style={styles.userColumn}>
        <Typography
          variant="body2"
          weight="semibold"
          numberOfLines={1}
          style={styles.nickname}
        >
          {item.nickname}
        </Typography>
        <Typography variant="caption2" style={styles.userId}>
          #{item.userId}
        </Typography>
      </View>
      <View style={styles.valueColumn}>
        <Typography variant="body2" weight="bold" style={styles.primaryValue}>
          {value.primary}
        </Typography>
        <Typography variant="caption2" style={styles.secondaryValue}>
          {value.secondary}
        </Typography>
      </View>
    </View>
  );
};

const RankingItemSeparator = () => <View style={styles.separator} />;

const RANKING_ITEM_HEIGHT = 82;
const RANKING_ITEM_GAP = 8;
const getRankingItemLayout = (_: RankingEntry[] | null, index: number) => ({
  length: RANKING_ITEM_HEIGHT,
  offset: (RANKING_ITEM_HEIGHT + RANKING_ITEM_GAP) * index,
  index,
});

const RankingList = ({
  data,
  errorMessage,
  isLoading,
  refreshing,
  mode,
  statType,
  onRefresh,
}: RankingListProps) => {
  const { theme } = useAppTheme();
  const entries = getRankingEntries(data);
  const renderItem = useCallback<ListRenderItem<RankingEntry>>(
    ({ item, index }) => (
      <RankingItem item={item} index={index} mode={mode} statType={statType} />
    ),
    [mode, statType],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (errorMessage) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message={errorMessage}
        transparent
      />
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="trophy-outline"
        message="랭킹 데이터가 없습니다."
        transparent
      />
    );
  }

  return (
    <View style={styles.list}>
      <FlashList
        data={entries}
        keyExtractor={(item) => `${mode}-${statType ?? 'level'}-${item.userId}`}
        renderItem={renderItem}
        ItemSeparatorComponent={RankingItemSeparator}
        contentContainerStyle={styles.content}
        estimatedItemSize={RANKING_ITEM_HEIGHT}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={getRankingItemLayout}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.action.primary.default}
          />
        }
      />
    </View>
  );
};

export default RankingList;

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: baseFoundation.dimension.x80,
  },
  separator: {
    height: theme.foundation.spacing[2],
  },
  card: {
    minHeight: baseFoundation.dimension.x72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
    padding: theme.foundation.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
  },
  podiumCard: {
    borderColor: theme.colors.brand.text,
    backgroundColor: theme.colors.background.elevated,
  },
  rankBadge: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x18,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  podiumRankBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  rankText: {
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  podiumRankText: {
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  userColumn: {
    flex: 1,
    minWidth: 0,
    gap: theme.foundation.spacing[1],
  },
  nickname: {
    color: '#FFFFFF',
  },
  userId: {
    color: theme.colors.text.secondary,
  },
  valueColumn: {
    minWidth: baseFoundation.dimension.x72,
    alignItems: 'flex-end',
    gap: theme.foundation.spacing[1],
  },
  primaryValue: {
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  secondaryValue: {
    color: theme.colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
}));
