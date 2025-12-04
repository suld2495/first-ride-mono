import { StyleSheet } from 'react-native-unistyles';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { Quest } from '@repo/types';
import { useRouter } from 'expo-router';

import Container from '@/components/layout/Container';
import QuestHeader from '@/components/quest/QuestHeader';
import QuestList from '@/components/quest/QuestList';
import QuestStatusTabs from '@/components/quest/QuestStatusTabs';
import QuestTypeFilter from '@/components/quest/QuestTypeFilter';
import { useQuestStore } from '@/store/quest.store';

export default function QuestPage() {
  const router = useRouter();
  const setQuestId = useQuestStore((state) => state.setQuestId);
  const statusFilter = useQuestStore((state) => state.statusFilter);
  const typeFilter = useQuestStore((state) => state.typeFilter);
  const setStatusFilter = useQuestStore((state) => state.setStatusFilter);
  const setTypeFilter = useQuestStore((state) => state.setTypeFilter);

  const { data: quests, isLoading } = useFetchQuestsQuery();

  if (isLoading) {
    return null;
  }

  // Apply filters
  const filteredQuests = (quests || []).filter((quest: Quest) => {
    // Status filter
    if (statusFilter !== 'ALL') {
      if (quest.status !== statusFilter) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      if (quest.questType !== typeFilter) {
        return false;
      }
    }

    return true;
  });

  const handleClickQuest = (quest: Quest) => {
    setQuestId(quest.questId);
    router.push('/modal?type=quest-detail');
  };

  return (
    <Container style={styles.container}>
      <QuestHeader />
      <QuestStatusTabs selected={statusFilter} onSelect={setStatusFilter} />
      <QuestTypeFilter selected={typeFilter} onSelect={setTypeFilter} />
      <QuestList quests={filteredQuests} onClickItem={handleClickQuest} />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flex: 1,
  },
});
