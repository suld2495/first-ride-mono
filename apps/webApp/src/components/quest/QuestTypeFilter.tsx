import type { QuestTypeFilter as QuestTypeFilterType } from "@/store/quest.store";
import Paragraph from "../common/paragraph/Paragraph";

interface QuestTypeFilterProps {
  selected: QuestTypeFilterType;
  onSelect: (type: QuestTypeFilterType) => void;
}

const FILTERS: { value: QuestTypeFilterType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DAILY', label: '일일' },
  { value: 'WEEKLY', label: '주간' },
];

const QuestTypeFilter = ({ selected, onSelect }: QuestTypeFilterProps) => {
  return (
    <div className="bg-slate-900/40 border-b border-cyan-600 py-2">
      <div className="flex gap-2 px-3 overflow-x-auto">
        {FILTERS.map((filter) => {
          const isSelected = selected === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => onSelect(filter.value)}
              className={`
                py-1.5 px-4 rounded-full border transition-all whitespace-nowrap
                ${isSelected
                  ? 'border-amber-400 bg-amber-400/20 text-amber-400'
                  : 'border-cyan-600 bg-cyan-500/10 text-slate-400 hover:text-slate-300'}
              `}
            >
              <Paragraph
                className={`text-xs ${isSelected ? 'font-bold' : ''}`}
                color={isSelected ? '#fbbf24' : '#90a1b9'}
              >
                {filter.label}
              </Paragraph>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestTypeFilter;
