import {
  useDistributeStatsMutation,
  useMyStatsQuery,
} from '@repo/shared/hooks/useStat';
import type { UserStats } from '@repo/types';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

import ClassicStatList from '@/components/stat/classic/classic-stat-list';
import GridStatList from '@/components/stat/grid/grid-stat-list';
import RadarStatView from '@/components/stat/radar/radar-stat-view';
import StatDesignTabs, {
  type StatDesignType,
} from '@/components/stat/stat-design-tabs';
import StatHeader from '@/components/stat/stat-header';
import StatPointsBar from '@/components/stat/stat-points-bar';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useStatEditor } from '@/hooks/useStatEditor';

const StatModal = () => {
  const [activeTab, setActiveTab] = useState<StatDesignType>('classic');
  const user = useAuthUser();
  const userId = user?.userId ?? '';
  const { data, isLoading, refetch } = useMyStatsQuery(userId);
  const { mutate: distributeStats, isPending } =
    useDistributeStatsMutation(userId);
  const {
    isEditing,
    originalStats,
    pendingStats,
    availablePoints,
    usedPoints,
    startEditing,
    incrementStat,
    decrementStat,
    resetChanges,
    finishEditing,
    getDistributions,
  } = useStatEditor();

  const handleEdit = useCallback(() => {
    if (data) {
      startEditing(data.stats, data.availablePoints);
    }
  }, [data, startEditing]);

  const handleConfirm = useCallback(() => {
    const distributions = getDistributions();

    if (Object.keys(distributions).length === 0) return;

    distributeStats(
      { distributions },
      {
        onSuccess: () => {
          finishEditing();
          refetch();
        },
      },
    );
  }, [distributeStats, finishEditing, getDistributions, refetch]);

  const handleReset = useCallback(() => {
    resetChanges();
  }, [resetChanges]);

  const handleIncrement = useCallback(
    (key: keyof UserStats) => {
      incrementStat(key);
    },
    [incrementStat],
  );

  const handleDecrement = useCallback(
    (key: keyof UserStats) => {
      decrementStat(key);
    },
    [decrementStat],
  );

  if (isLoading || !data) {
    return <Loading />;
  }

  const displayStats = isEditing && pendingStats ? pendingStats : data.stats;
  const canIncrement = usedPoints < availablePoints;
  const commonStatListProps = {
    stats: displayStats,
    originalStats: isEditing ? originalStats || undefined : undefined,
    isEditing,
    canIncrement,
    onIncrement: handleIncrement,
    onDecrement: handleDecrement,
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <StatHeader
          nickname={data.nickname}
          level={data.currentLevel}
          currentExp={data.currentLevelProgress}
          expForNextLevel={data.expForNextLevel}
        />

        <StatDesignTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <StatPointsBar
          availablePoints={data.availablePoints}
          usedPoints={usedPoints}
          isEditing={isEditing}
          onEdit={handleEdit}
          onConfirm={handleConfirm}
          onReset={handleReset}
        />

        <View style={styles.statContainer}>
          {activeTab === 'classic' ? (
            <ClassicStatList {...commonStatListProps} />
          ) : null}
          {activeTab === 'grid' ? (
            <GridStatList {...commonStatListProps} />
          ) : null}
          {activeTab === 'radar' ? (
            <RadarStatView {...commonStatListProps} />
          ) : null}
        </View>
      </ScrollView>

      {isPending ? (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      ) : null}
    </View>
  );
};

export default StatModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[8],
  },
  statContainer: {
    marginTop: theme.foundation.spacing[2],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
