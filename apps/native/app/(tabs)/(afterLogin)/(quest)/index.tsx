import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import type { Quest } from '@repo/types';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import QuestHeader from '@/components/quest/quest-header';
import QuestList from '@/components/quest/quest-list';
import QuestStatusTabs from '@/components/quest/quest-status-tabs';
import QuestTypeFilter from '@/components/quest/quest-type-filter';
import Loading from '@/components/ui/loading';
import {
  useQuestStatusFilter,
  useQuestTypeFilter,
  useSetQuestId,
  useSetQuestStatusFilter,
  useSetQuestTypeFilter,
} from '@/hooks/useQuestSelection';

export default function QuestPage() {
  const router = useRouter();
  const setQuestId = useSetQuestId();
  const statusFilter = useQuestStatusFilter();
  const typeFilter = useQuestTypeFilter();
  const setStatusFilter = useSetQuestStatusFilter();
  const setTypeFilter = useSetQuestTypeFilter();

  const { data: quests, isLoading } = useFetchQuestsQuery({
    status: statusFilter,
    questType: typeFilter,
  });

  if (isLoading) {
    return (
      <Container style={styles.container}>
        <QuestHeader />
        <Loading />
      </Container>
    );
  }

  const handleClickQuest = (quest: Quest) => {
    setQuestId(quest.questId);
    router.push('/modal?type=quest-detail');
  };

  return (
    <Container style={styles.container} noPadding>
      <Header />
      <View style={styles.content}>
        <QuestHeader />
        <QuestStatusTabs selected={statusFilter} onSelect={setStatusFilter} />
        <QuestTypeFilter selected={typeFilter} onSelect={setTypeFilter} />
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
    paddingHorizontal: theme.foundation.spacing.m,
  },
}));
