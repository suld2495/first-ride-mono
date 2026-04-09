import {
  useDistributeStatsMutation,
  useMyStatsQuery,
} from '@repo/shared/hooks/useStat';
import type { UserStats } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import ClassicStatList from '@/components/stat/classic/classic-stat-list';
import GridStatList from '@/components/stat/grid/grid-stat-list';
import RadarStatView from '@/components/stat/radar/radar-stat-view';
import StatDesignTabs, {
  type StatDesignType,
} from '@/components/stat/stat-design-tabs';
import StatHeader from '@/components/stat/stat-header';
import StatPointsBar from '@/components/stat/stat-points-bar';
import Loading from '@/components/ui/loading';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useStatEditor } from '@/hooks/useStatEditor';

export default function StatPage() {
  const router = useRouter();
  const user = useAuthUser();
  const [activeTab, setActiveTab] = useState<StatDesignType>('classic');

  const { data, isLoading, refetch } = useMyStatsQuery();
  const { mutate: distributeStats, isPending } = useDistributeStatsMutation();

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
  }, [distributeStats, getDistributions, finishEditing, refetch]);

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

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <Container style={styles.container} noPadding>
        <Header />
        <Loading />
      </Container>
    );
  }

  const displayStats = isEditing && pendingStats ? pendingStats : data.stats;
  const canIncrement = usedPoints < availablePoints;

  const renderStatView = () => {
    const commonProps = {
      stats: displayStats,
      originalStats: isEditing ? originalStats || undefined : undefined,
      isEditing,
      canIncrement,
      onIncrement: handleIncrement,
      onDecrement: handleDecrement,
    };

    switch (activeTab) {
      case 'classic':
        return <ClassicStatList {...commonProps} />;
      case 'grid':
        return <GridStatList {...commonProps} />;
      case 'radar':
        return <RadarStatView {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Container style={styles.container} noPadding>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StatHeader
          nickname={data.nickname}
          level={data.currentLevel}
          currentExp={data.currentTotalExp}
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

        <View style={styles.statContainer}>{renderStatView()}</View>

        {isPending && (
          <View style={styles.loadingOverlay}>
            <Loading />
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.foundation.spacing.m,
    paddingBottom: theme.foundation.spacing.xl,
  },
  statContainer: {
    marginTop: theme.foundation.spacing.s,
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
