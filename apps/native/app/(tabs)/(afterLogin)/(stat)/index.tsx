import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { UserStats } from '@repo/types';
import {
  useMyStatsQuery,
  useDistributeStatsMutation,
} from '@repo/shared/hooks/useStat';
import { useRouter } from 'expo-router';

import Loading from '@/components/common/Loading';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import ClassicStatList from '@/components/stat/classic/ClassicStatList';
import GridStatList from '@/components/stat/grid/GridStatList';
import RadarStatView from '@/components/stat/radar/RadarStatView';
import StatDesignTabs, {
  type StatDesignType,
} from '@/components/stat/StatDesignTabs';
import StatHeader from '@/components/stat/StatHeader';
import StatPointsBar from '@/components/stat/StatPointsBar';
import { useAuthStore } from '@/store/auth.store';
import { useStatStore } from '@/store/stat.store';

export default function StatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
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
  } = useStatStore();

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

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (isLoading || !data) {
    return (
      <Container style={styles.container}>
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
    }
  };

  return (
    <Container style={styles.container}>
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
    padding: 16,
    paddingBottom: 32,
  },
  statContainer: {
    marginTop: 8,
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
