import { useNavigate, useParams } from 'react-router';
import { useFetchQuestDetailQuery } from '@repo/shared/hooks/useQuest';

import Button from '@/components/common/button/Button';
import DarkMode from '@/components/common/DarkMode';
import Paragraph from '@/components/common/paragraph/Paragraph';
import { getQuestTypeBadgeClass } from '@/utils/quest-utils';
import { formatQuestPeriod } from '@repo/shared/utils/quest-utils';

const QuestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quest, isLoading, error } = useFetchQuestDetailQuery(id || '');

  const handleBack = () => {
    navigate('/admin/quest-management');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-[var(--max-width)]">
        <div className="text-center py-8">로딩 중...</div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="container mx-auto p-4 max-w-[var(--max-width)]">
        <div className="text-center py-8 text-red-500">
          퀘스트를 불러올 수 없습니다.
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={handleBack}>목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-[var(--max-width)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Paragraph variant="h2" className="font-bold mb-2">
            퀘스트 상세
          </Paragraph>
          <div className="flex gap-3 items-center">
            <DarkMode />
            <Button onClick={handleBack}>목록으로</Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          퀘스트 관리 &gt; 퀘스트 상세
        </p>
      </div>

      {/* Quest Detail Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Title and Type */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Paragraph variant="h3" className="font-bold mb-2">
              {quest.questName}
            </Paragraph>
            <span
              className={`px-3 py-1 rounded text-sm ${getQuestTypeBadgeClass(quest.questType)}`}
            >
              {quest.questType}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <Paragraph className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            설명
          </Paragraph>
          <Paragraph className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {quest.description}
          </Paragraph>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Period */}
          <div>
            <Paragraph className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              기간
            </Paragraph>
            <Paragraph className="text-gray-600 dark:text-gray-400">
              {formatQuestPeriod(quest.startDate, quest.endDate)}
            </Paragraph>
          </div>

          {/* Required Level */}
          <div>
            <Paragraph className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              필요 레벨
            </Paragraph>
            <Paragraph className="text-gray-600 dark:text-gray-400">
              레벨 {quest.requiredLevel}
            </Paragraph>
          </div>

          {/* Reward */}
          <div>
            <Paragraph className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              보상
            </Paragraph>
            <Paragraph className="text-gray-600 dark:text-gray-400">
              {quest.rewardName || `보상 ID: ${quest.rewardId}`}
            </Paragraph>
          </div>

          {/* Max Participants */}
          {quest.maxParticipants !== undefined && (
            <div>
              <Paragraph className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                최대 참가자
              </Paragraph>
              <Paragraph className="text-gray-600 dark:text-gray-400">
                {quest.maxParticipants}명
              </Paragraph>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Paragraph className="text-gray-500 dark:text-gray-400">
                생성일: {new Date(quest.createdAt).toLocaleString('ko-KR')}
              </Paragraph>
            </div>
            <div>
              <Paragraph className="text-gray-500 dark:text-gray-400">
                수정일: {new Date(quest.updatedAt).toLocaleString('ko-KR')}
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestDetail;
