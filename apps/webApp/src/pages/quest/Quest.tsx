import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { Quest } from '@repo/types';

import QuestList from '@/components/quest/QuestList';
import QuestStatusTabs from '@/components/quest/QuestStatusTabs';
import QuestTypeFilter from '@/components/quest/QuestTypeFilter';
import QuestHeader from '@/layouts/quest/QuestHeader';
import { ModalName, useModalStore } from '@/store/modal.store';
import { useQuestStore } from '@/store/quest.store';

const QuestPage = () => {
  const showModal = useModalStore((state) => state.show);
  const setQuestId = useQuestStore((state) => state.setQuestId);
  const statusFilter = useQuestStore((state) => state.statusFilter);
  const typeFilter = useQuestStore((state) => state.typeFilter);
  const setStatusFilter = useQuestStore((state) => state.setStatusFilter);
  const setTypeFilter = useQuestStore((state) => state.setTypeFilter);

  const { data: quests = [] } = useFetchQuestsQuery();

  // Apply filters
  const filteredQuests = quests.filter((quest: Quest) => {
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

  const handleClick = ({ questId }: Quest) => {
    showModal(ModalName.QUEST_DETAIL);
    setQuestId(questId);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100%-var(--footer-height))]">
      <QuestHeader />
      <QuestStatusTabs selected={statusFilter} onSelect={setStatusFilter} />
      <QuestTypeFilter selected={typeFilter} onSelect={setTypeFilter} />
      <QuestList quests={filteredQuests} onClickItem={handleClick} />
    </div>
  );
};

export default QuestPage;
