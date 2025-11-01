import { useNavigate } from 'react-router';
import { Quest } from '@repo/types';
import { truncateQuestName, formatQuestPeriod } from '@repo/shared/utils/quest-utils';
import { getQuestTypeBadgeClass } from '@/utils/quest-utils';
import Button from '@/components/common/button/Button';
import Paragraph from '@/components/common/paragraph/Paragraph';

interface QuestTableProps {
  quests: Quest[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (quest: Quest) => void;
  onDelete: (id: string) => void;
}

const QuestTable = ({
  quests,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
}: QuestTableProps) => {
  const navigate = useNavigate();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuests = quests.slice(startIndex, startIndex + itemsPerPage);

  const handleQuestNameClick = (id: string) => {
    navigate(`/admin/quest-management/${id}`);
  };

  if (quests.length === 0) {
    return <div className="text-center py-8 text-gray-main dark:text-gray-200">퀘스트가 없습니다</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-[1px] border-gray-300 dark:border-gray-600">
            <th className="p-3 text-left text-gray-main dark:text-gray-200"><Paragraph>No</Paragraph></th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200"><Paragraph>퀘스트명</Paragraph></th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200"><Paragraph>타입</Paragraph></th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200"><Paragraph>기간</Paragraph></th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200"><Paragraph>레벨</Paragraph></th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200"><Paragraph>액션</Paragraph></th>
          </tr>
        </thead>
        <tbody>
          {paginatedQuests.map((quest, index) => (
            <tr key={quest.id} className="border-b-[1px] border-gray-200 dark:border-gray-700">
              <td className="p-3 text-gray-main dark:text-gray-200"><Paragraph>{startIndex + index + 1}</Paragraph></td>
              <td
                className="p-3 text-gray-main dark:text-gray-200 cursor-pointer hover:text-primary-main dark:hover:text-primary-light transition-colors"
                title={quest.questName}
                onClick={() => handleQuestNameClick(quest.id)}
              >
                <Paragraph className="hover:underline">{truncateQuestName(quest.questName, 20)}</Paragraph>
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${getQuestTypeBadgeClass(quest.questType)}`}>
                  {quest.questType}
                </span>
              </td>
              <td className="p-3 text-gray-main dark:text-gray-200">
                <Paragraph>{formatQuestPeriod(quest.startDate, quest.endDate)}</Paragraph>
              </td>
              <td className="p-3 text-gray-main dark:text-gray-200"><Paragraph>{quest.requiredLevel}</Paragraph></td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button size="small" onClick={() => onEdit(quest)}>수정</Button>
                  <Button size="small" variant="plain" onClick={() => onDelete(quest.id)}>삭제</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestTable;
