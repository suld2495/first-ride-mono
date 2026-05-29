import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import type { Quest } from '@repo/types';
import { useRouter } from 'expo-router';
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
import { baseFoundation } from '@/theme/tokens';

export default function QuestPage() {
  const router = useRouter();
  const user = useAuthUser();
  const setQuestId = useSetQuestId();
  const statusFilter = useQuestStatusFilter();
  const setStatusFilter = useSetQuestStatusFilter();
  const isAdmin = user?.role === 'ADMIN';

  const { data: quests, isLoading } = useFetchQuestsQuery({
    status: 'ACTIVE',
    completed: false,
  });

  if (isLoading) {
    return (
      <Container style={styles.container} noPadding>
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
    <Container style={styles.container} noPadding>
      <QuestHeader />
      <View style={styles.content}>
        <QuestStatusTabs
          selected={statusFilter}
          onSelect={setStatusFilter}
          right={
            isAdmin ? (
              <Button
                title="추가"
                variant="primary"
                size="sm"
                onPress={handleAddQuest}
                style={styles.addButton}
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
    minWidth: baseFoundation.dimension.x60,
  },
}));
