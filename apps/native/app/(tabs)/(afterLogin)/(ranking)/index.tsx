import {
  useAllLevelRankingQuery,
  useAllStatRankingsQuery,
  useFriendLevelRankingQuery,
  useStatRankingQuery,
} from '@repo/shared/hooks/useRanking';
import type { StatKey } from '@repo/types';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import Container from '@/components/layout/container';
import AllStatRankingList from '@/components/ranking/all-stat-ranking-list';
import RankingHeader from '@/components/ranking/ranking-header';
import RankingList from '@/components/ranking/ranking-list';
import RankingSegmentedControl from '@/components/ranking/ranking-segmented-control';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { RANKING_STAT_OPTIONS, STAT_LABEL_BY_TYPE } from '@/constants/RANKING';
import { baseFoundation } from '@/theme/tokens';

type RankingMode = 'level' | 'stat';
type LevelScope = 'all' | 'friends';
type StatScope = StatKey | 'ALL';

const RANKING_MODE_OPTIONS = [
  { label: '레벨', value: 'level' },
  { label: '스탯', value: 'stat' },
] as const;

const LEVEL_SCOPE_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '친구', value: 'friends' },
] as const;

const STAT_SCOPE_OPTIONS = [
  { label: '전체', value: 'ALL' },
  ...RANKING_STAT_OPTIONS,
] as const;

const LEVEL_RANKING_TOP_N = 50;
const STAT_RANKING_TOP_N = 10;

interface RankingRefetchable {
  refetch: () => Promise<unknown>;
}

const getRankingDescription = ({
  levelScope,
  mode,
  statScope,
}: {
  levelScope: LevelScope;
  mode: RankingMode;
  statScope: StatScope;
}) => {
  if (mode === 'level') {
    return levelScope === 'all'
      ? `상위 ${LEVEL_RANKING_TOP_N}명`
      : '내 친구와 나';
  }

  return statScope === 'ALL'
    ? `스탯별 상위 ${STAT_RANKING_TOP_N}명`
    : `${STAT_LABEL_BY_TYPE[statScope]} 상위 ${STAT_RANKING_TOP_N}명`;
};

const getActiveRankingQuery = ({
  activeLevelQuery,
  allStatRankings,
  mode,
  showAllStatRankings,
  statRanking,
}: {
  activeLevelQuery: RankingRefetchable;
  allStatRankings: RankingRefetchable;
  mode: RankingMode;
  showAllStatRankings: boolean;
  statRanking: RankingRefetchable;
}) => {
  if (mode === 'level') {
    return activeLevelQuery;
  }

  return showAllStatRankings ? allStatRankings : statRanking;
};

interface RankingStatTabsProps {
  value: StatScope;
  onChange: (value: StatScope) => void;
}

const RankingStatTabs = ({ value, onChange }: RankingStatTabsProps) => {
  return (
    <View style={styles.statTabs}>
      {STAT_SCOPE_OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.statChip, selected ? styles.selectedStatChip : null]}
          >
            <Text
              style={[
                styles.statChipText,
                selected ? styles.selectedStatChipText : null,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

interface RankingScopeControlsProps {
  levelScope: LevelScope;
  mode: RankingMode;
  onChangeLevelScope: (value: LevelScope) => void;
  onChangeStatScope: (value: StatScope) => void;
  statScope: StatScope;
}

const RankingScopeControls = ({
  levelScope,
  mode,
  onChangeLevelScope,
  onChangeStatScope,
  statScope,
}: RankingScopeControlsProps) => {
  if (mode === 'level') {
    return (
      <RankingSegmentedControl
        options={LEVEL_SCOPE_OPTIONS}
        value={levelScope}
        onChange={onChangeLevelScope}
      />
    );
  }

  return <RankingStatTabs value={statScope} onChange={onChangeStatScope} />;
};

interface RankingBodyProps {
  allStatRankings: ReturnType<typeof useAllStatRankingsQuery>;
  activeLevelQuery: ReturnType<typeof useAllLevelRankingQuery>;
  mode: RankingMode;
  onRefresh: () => void;
  refreshing: boolean;
  showAllStatRankings: boolean;
  statRanking: ReturnType<typeof useStatRankingQuery>;
  statScope: StatScope;
}

const RankingBody = ({
  activeLevelQuery,
  allStatRankings,
  mode,
  onRefresh,
  refreshing,
  showAllStatRankings,
  statRanking,
  statScope,
}: RankingBodyProps) => {
  if (showAllStatRankings) {
    return (
      <AllStatRankingList
        data={allStatRankings.data}
        errorMessage={
          allStatRankings.isError
            ? '스탯 랭킹을 불러오지 못했습니다.'
            : undefined
        }
        isLoading={allStatRankings.isLoading}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <RankingList
      data={
        mode === 'level'
          ? (activeLevelQuery.data ?? [])
          : (statRanking.data ?? [])
      }
      errorMessage={
        mode === 'level'
          ? activeLevelQuery.isError
            ? '레벨 랭킹을 불러오지 못했습니다.'
            : undefined
          : statRanking.isError
            ? '스탯 랭킹을 불러오지 못했습니다.'
            : undefined
      }
      isLoading={
        mode === 'level' ? activeLevelQuery.isLoading : statRanking.isLoading
      }
      refreshing={refreshing}
      mode={mode}
      statType={statScope === 'ALL' ? undefined : statScope}
      onRefresh={onRefresh}
    />
  );
};

export default function RankingPage() {
  const [mode, setMode] = useState<RankingMode>('level');
  const [levelScope, setLevelScope] = useState<LevelScope>('all');
  const [statScope, setStatScope] = useState<StatScope>('STRENGTH');
  const [refreshing, setRefreshing] = useState(false);
  const showAllLevelRanking = mode === 'level' && levelScope === 'all';
  const showFriendLevelRanking = mode === 'level' && levelScope === 'friends';
  const showAllStatRankings = mode === 'stat' && statScope === 'ALL';
  const showStatRanking = mode === 'stat' && statScope !== 'ALL';

  const allLevelRanking = useAllLevelRankingQuery(LEVEL_RANKING_TOP_N, {
    enabled: showAllLevelRanking,
  });
  const friendLevelRanking = useFriendLevelRankingQuery({
    enabled: showFriendLevelRanking,
  });
  const statRanking = useStatRankingQuery(
    statScope === 'ALL' ? 'STRENGTH' : statScope,
    STAT_RANKING_TOP_N,
    {
      enabled: showStatRanking,
    },
  );
  const allStatRankings = useAllStatRankingsQuery(STAT_RANKING_TOP_N, {
    enabled: showAllStatRankings,
  });

  const activeLevelQuery =
    levelScope === 'all' ? allLevelRanking : friendLevelRanking;
  const activeQuery = getActiveRankingQuery({
    activeLevelQuery,
    allStatRankings,
    mode,
    showAllStatRankings,
    statRanking,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await activeQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [activeQuery]);

  return (
    <Container style={styles.container} noPadding>
      <RankingHeader />
      <View style={styles.content}>
        <RankingSegmentedControl
          options={RANKING_MODE_OPTIONS}
          value={mode}
          onChange={setMode}
        />

        <RankingScopeControls
          levelScope={levelScope}
          mode={mode}
          onChangeLevelScope={setLevelScope}
          onChangeStatScope={setStatScope}
          statScope={statScope}
        />

        <Typography variant="caption1" style={styles.description}>
          {getRankingDescription({ levelScope, mode, statScope })}
        </Typography>

        <RankingBody
          activeLevelQuery={activeLevelQuery}
          allStatRankings={allStatRankings}
          mode={mode}
          refreshing={refreshing}
          showAllStatRankings={showAllStatRankings}
          statRanking={statRanking}
          statScope={statScope}
          onRefresh={handleRefresh}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[4],
  },
  statTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.foundation.spacing[2],
    paddingVertical: theme.foundation.spacing[1],
  },
  statChip: {
    minWidth: baseFoundation.dimension.x52,
    minHeight: baseFoundation.dimension.x36,
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: theme.foundation.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.foundation.radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChipText: {
    color: theme.colors.text.secondary,
    fontSize: theme.foundation.typography.size.body3,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedStatChip: {
    borderColor: theme.colors.brand.text,
    backgroundColor: theme.colors.brand.text,
  },
  selectedStatChipText: {
    color: '#FFFFFF',
  },
  description: {
    color: theme.colors.text.muted,
  },
}));
