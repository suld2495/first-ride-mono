import type {
  AllStatRankingResponse,
  StatKey,
  StatRankingEntry,
} from '@repo/types';
import { RefreshControl, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { RANKING_STAT_OPTIONS, STAT_LABEL_BY_TYPE } from '@/constants/RANKING';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation } from '@/theme/tokens';

interface AllStatRankingListProps {
  data?: AllStatRankingResponse;
  errorMessage?: string;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

type AllStatRankingRow =
  | {
      id: string;
      label: string;
      statType: StatKey;
      type: 'header';
    }
  | {
      id: string;
      item: StatRankingEntry;
      rank: number;
      statType: StatKey;
      type: 'item';
    };

const getAllStatRankingRows = (
  data: AllStatRankingResponse | undefined,
): AllStatRankingRow[] =>
  RANKING_STAT_OPTIONS.flatMap((option) => {
    const rankingItems = data?.[option.value] ?? [];

    if (rankingItems.length === 0) {
      return [];
    }

    return [
      {
        id: `header-${option.value}`,
        label: option.label,
        statType: option.value,
        type: 'header',
      },
      ...rankingItems.map((item, itemIndex) => ({
        id: `item-${option.value}-${item.userId}`,
        item,
        rank: item.rank ?? itemIndex + 1,
        statType: option.value,
        type: 'item' as const,
      })),
    ];
  });

const ALL_STAT_HEADER_HEIGHT = 38;
const ALL_STAT_ITEM_HEIGHT = 74;
const ALL_STAT_ITEM_GAP = 8;
const getAllStatItemLayout = (
  _: AllStatRankingRow[] | null,
  index: number,
) => ({
  length: ALL_STAT_ITEM_HEIGHT,
  offset: (ALL_STAT_ITEM_HEIGHT + ALL_STAT_ITEM_GAP) * index,
  index,
});

const AllStatRankingList = ({
  data,
  errorMessage,
  isLoading,
  refreshing,
  onRefresh,
}: AllStatRankingListProps) => {
  const { theme } = useAppTheme();

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

  const rows = getAllStatRankingRows(data);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="trophy-outline"
        message="랭킹 데이터가 없습니다."
        transparent
      />
    );
  }

  const renderItem: ListRenderItem<AllStatRankingRow> = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Typography variant="body3" weight="bold" style={styles.sectionTitle}>
            {item.label}
          </Typography>
          <Typography variant="caption2" style={styles.sectionSubtitle}>
            {STAT_LABEL_BY_TYPE[item.statType]} 랭킹
          </Typography>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.rankBadge}>
          <Typography variant="caption2" weight="bold" style={styles.rankText}>
            {item.rank}
          </Typography>
        </View>
        <View style={styles.userColumn}>
          <Typography variant="body2" weight="semibold" style={styles.nickname}>
            {item.item.nickname}
          </Typography>
          <Typography variant="caption2" style={styles.statName}>
            #{item.item.userId}
          </Typography>
        </View>
        <Typography variant="body2" weight="bold" style={styles.value}>
          {item.item.value.toLocaleString()}
        </Typography>
      </View>
    );
  };

  return (
    <View style={styles.list}>
      <FlashList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={AllStatItemSeparator}
        contentContainerStyle={styles.content}
        estimatedItemSize={ALL_STAT_ITEM_HEIGHT + ALL_STAT_HEADER_HEIGHT}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={getAllStatItemLayout}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
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

export default AllStatRankingList;

const AllStatItemSeparator = () => <View style={styles.separator} />;

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
  sectionHeader: {
    minHeight: ALL_STAT_HEADER_HEIGHT,
    justifyContent: 'center',
    gap: theme.foundation.spacing[0.5],
    paddingTop: theme.foundation.spacing[2],
  },
  sectionTitle: {
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    color: theme.colors.text.tertiary,
  },
  card: {
    minHeight: ALL_STAT_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
    padding: theme.foundation.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
  },
  rankBadge: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x18,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  rankText: {
    color: theme.colors.text.inverse,
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
  statName: {
    color: theme.colors.text.secondary,
  },
  value: {
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
}));
