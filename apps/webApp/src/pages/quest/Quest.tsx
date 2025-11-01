import QuestList from "@/components/quest/QuestList";
import QuestHeader from "@/layouts/quest/QuestHeader";
import { ModalName, useModalStore } from "@/store/modal.store";
import { useQuestStore } from "@/store/quest.store";
import { Quest } from "@repo/types";

const QuestPage = () => {
  const showModal = useModalStore((state) => state.show);
  const setQuestId = useQuestStore((state) => state.setQuestId);

  const handleClick = ({ questId }: Quest) => {
    showModal(ModalName.QUEST_DETAIL);
    setQuestId(questId);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100%-var(--footer-height))]">
      <QuestHeader />
      <QuestList onClickItem={handleClick} />
    </div>
  )
};

export default QuestPage;
