import Ionicons from '@expo/vector-icons/Ionicons';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import type { Quest } from '@repo/types';
import { useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { View } from 'react-native';

import Container from '@/components/layout/container';
import QuestHeader from '@/components/quest/quest-header';
import QuestList from '@/components/quest/quest-list';
import QuestStatusTabs from '@/components/quest/quest-status-tabs';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
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

  useLayoutEffect(() => {
    clearColorSchemeOverride();
  }, [clearColorSchemeOverride]);

  const { data: quests, isLoading } = useFetchQuestsQuery(user?.userId ?? '', {
    status: 'ACTIVE',
    completed: false,
  });

  if (isLoading) {
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
        <QuestList quests={quests || []} onClickItem={handleClickQuest} />
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
    paddingHorizontal: theme.foundation.spacing[4],
    gap: theme.foundation.spacing[2],
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
