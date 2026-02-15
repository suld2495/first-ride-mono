import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { Quest } from '@repo/types';
import { useRouter } from 'expo-router';

import Loading from '@/components/common/Loading';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
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
