import { QuestTypeFilter } from '@repo/types';

import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import Select from '@/components/common/Select';

interface QuestFilterProps {
  selectedType: QuestTypeFilter;
  searchQuery: string;
  onTypeChange: (type: QuestTypeFilter) => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

const QuestFilter = ({
  selectedType,
  searchQuery,
  onTypeChange,
  onSearchChange,
  onSearchSubmit,
}: QuestFilterProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-main dark:text-gray-200 whitespace-nowrap">
          타입:
        </span>
        <Select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as QuestTypeFilter)}
          options={[
            { label: '전체', value: 'ALL' },
            { label: 'DAILY', value: 'DAILY' },
            { label: 'WEEKLY', value: 'WEEKLY' },
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-main dark:text-gray-200">검색:</span>
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          placeholder="퀘스트명 검색"
        />
        <Button onClick={onSearchSubmit}>🔍</Button>
      </div>
    </div>
  );
};

export default QuestFilter;
