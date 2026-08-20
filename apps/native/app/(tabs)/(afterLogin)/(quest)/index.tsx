import Ionicons from '@expo/vector-icons/Ionicons';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import type { Quest } from '@repo/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';

import Container from '@/components/layout/container';
import QuestHeader from '@/components/quest/quest-header';
import QuestList from '@/components/quest/quest-list';
import QuestStatusTabs from '@/components/quest/quest-status-tabs';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import {
  useQuestStatusFilter,
  useSetQuestId,
  useSetQuestStatusFilter,
} from '@/hooks/useQuestSelection';
import {
  useBaseColorSchemeValue,
  useClearAppColorSchemeOverride,
} from '@/hooks/useThemePreference';
import { appThemes } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

export default function QuestPage() {
  const router = useRouter();
  const user = useAuthUser();
  const setQuestId = useSetQuestId();
  const statusFilter = useQuestStatusFilter();
  const setStatusFilter = useSetQuestStatusFilter();
  const baseThemeName = useBaseColorSchemeValue();
  const clearColorSchemeOverride = useClearAppColorSchemeOverride();
  const isAdmin = user?.role === 'ADMIN';
  const pageBackgroundColor = appThemes[baseThemeName].colors.background.base;
  const userId = user?.userId ?? '';
  const [isQuestPageFocused, setIsQuestPageFocused] = useState(false);
  const questQueryParams =
    statusFilter === 'ALL'
      ? { status: 'ALL' as const, scope: 'ALL' as const }
      : { status: 'ALL' as const, scope: 'IN_PROGRESS' as const };

  useLayoutEffect(() => {
    clearColorSchemeOverride();
  }, [clearColorSchemeOverride]);

  const {
    data: quests,
    isError,
    isFetching,
    isLoading,
    isPending,
    refetch,
  } = useFetchQuestsQuery(userId, questQueryParams, {
    enabled: isQuestPageFocused,
  });
  const hasQuests = (quests?.length ?? 0) > 0;
  const isQuestLoading = isPending || isLoading || (isFetching && !hasQuests);

  useFocusEffect(
    useCallback(() => {
      setStatusFilter('ACTIVE');
      setIsQuestPageFocused(true);

      return () => {
        setIsQuestPageFocused(false);
      };
    }, [setStatusFilter]),
  );

  if (isQuestLoading) {
    return (
      <Container
        style={[styles.container, { backgroundColor: pageBackgroundColor }]}
        noPadding
        testID="quest-page"
      >
        <QuestHeader />
        <View style={styles.content}>
          <Loading />
        </View>
      </Container>
    );
  }

  if (isError && !hasQuests) {
    return (
      <Container
        style={[styles.container, { backgroundColor: pageBackgroundColor }]}
        noPadding
        testID="quest-page"
      >
        <QuestHeader />
        <View style={[styles.content, styles.errorContent]}>
          <Typography variant="body" color="secondary">
            퀘스트를 불러오지 못했습니다.
          </Typography>
          <Button
            title="다시 시도"
            variant="outline"
            onPress={() => void refetch()}
          />
        </View>
      </Container>
    );
  }

  const handleClickQuest = (quest: Quest) => {
    setQuestId(quest.questId);
    router.push('/modal?type=quest-detail');
  };

  const handleAddQuest = () => {
    router.push('/modal?type=quest-add');
  };

  return (
    <Container
      style={[styles.container, { backgroundColor: pageBackgroundColor }]}
      noPadding
      testID="quest-page"
    >
      <QuestHeader />
      <View style={styles.content}>
        <QuestStatusTabs
          selected={statusFilter}
          onSelect={setStatusFilter}
          right={
            isAdmin ? (
              <Button
                testID="quest-add-button"
                title="추가"
                variant="ghost"
                size="sm"
                leftIcon={({ color }) => (
                  <Ionicons
                    name="add"
                    size={baseFoundation.iconSize.m - 4}
                    color={color}
                  />
                )}
                onPress={handleAddQuest}
                backgroundColor="#111827"
                textColor="#FFFFFF"
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
              />
            ) : undefined
          }
        />
        <QuestList
          key={questQueryParams.scope}
          quests={quests ?? []}
          onClickItem={handleClickQuest}
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
    paddingHorizontal: theme.foundation.spacing[6],
    gap: theme.foundation.spacing[2],
  },
  errorContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    height: baseFoundation.dimension.x28,
    minHeight: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[3],
  },
  addButtonContent: {
    gap: baseFoundation.dimension.x2,
  },
}));
