import type { QuestStatus } from "@/store/quest.store";
import Paragraph from "../common/paragraph/Paragraph";

interface QuestStatusTabsProps {
  selected: QuestStatus;
  onSelect: (status: QuestStatus) => void;
}

const TABS: { value: QuestStatus; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
];

const QuestStatusTabs = ({ selected, onSelect }: QuestStatusTabsProps) => {
  return (
    <div className="flex justify-around py-3 px-2 bg-slate-900/60 border-b border-cyan-600">
      {TABS.map((tab) => {
        const isSelected = selected === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onSelect(tab.value)}
            className={`
              flex-1 py-2 px-3 rounded transition-all
              ${isSelected
                ? 'bg-cyan-500/10 border border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'}
            `}
          >
            <Paragraph
              className="font-semibold"
              color={isSelected ? '#1ddeff' : '#90a1b9'}
            >
              {tab.label}
            </Paragraph>
          </button>
        );
      })}
    </div>
  );
};

export default QuestStatusTabs;
