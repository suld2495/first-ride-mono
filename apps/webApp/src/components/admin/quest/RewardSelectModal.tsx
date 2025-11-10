import { useMemo, useState } from 'react';
import { useFetchRewardsQuery } from '@repo/shared/hooks/useQuest';
import { Reward } from '@repo/types';

import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import Pagination from '@/components/common/Pagination';
import Paragraph from '@/components/common/paragraph/Paragraph';
import ToastContainer from '@/components/common/ToastContainer';
import { useToast } from '@/hooks/useToast';

interface RewardSelectModalProps {
  isOpen: boolean;
  selectedRewardId?: number;
  onClose: () => void;
  onSelect: (reward: Reward) => void;
}

const RewardSelectModal = ({
  isOpen,
  selectedRewardId,
  onClose,
  onSelect,
}: RewardSelectModalProps) => {
  const { data: rewards = [], isLoading } = useFetchRewardsQuery();
  const { toasts, error, removeToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | undefined>(
    selectedRewardId,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredRewards = useMemo(() => {
    if (!searchQuery) return rewards;
    return rewards.filter((r) =>
      r.rewardName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [rewards, searchQuery]);

  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = filteredRewards.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSelect = () => {
    if (!selectedId) {
      error('보상을 선택해주세요');
      return;
    }
    const reward = rewards.find((r) => r.rewardId === selectedId);

    if (reward) {
      onSelect(reward);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed w-full h-dvh top-0 left-0 flex items-center justify-center px-5 z-10">
      <div
        className="absolute w-full h-full bg-gray-950 opacity-50"
        onClick={onClose}
      />
      <div className="relative z-1 p-6 bg-white dark:bg-dark-primary-color rounded-xl max-w-[var(--max-width)] w-full">
        <Paragraph
          className="pb-5 border-b-[1px] border-b-gray-300"
          variant="subtitle"
        >
          보상 선택
        </Paragraph>
        <div className="space-y-4 mt-5">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="보상명 검색"
            />
            <Button>🔍</Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-main dark:text-gray-200">
              로딩 중...
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="text-center py-8 text-gray-main dark:text-gray-200">
              검색 결과가 없습니다
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-[1px] border-gray-300 dark:border-gray-600">
                      <th className="p-3 text-left text-gray-main dark:text-gray-200">
                        No
                      </th>
                      <th className="p-3 text-left text-gray-main dark:text-gray-200">
                        보상명
                      </th>
                      <th className="p-3 text-left text-gray-main dark:text-gray-200">
                        타입
                      </th>
                      <th className="p-3 text-left text-gray-main dark:text-gray-200">
                        선택
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRewards.map((reward, index) => (
                      <tr
                        key={reward.rewardId}
                        className="border-b-[1px] border-gray-200 dark:border-gray-700"
                      >
                        <td className="p-3 text-gray-main dark:text-gray-200">
                          {startIndex + index + 1}
                        </td>
                        <td className="p-3 text-gray-main dark:text-gray-200">
                          {reward.rewardName}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-500 dark:bg-gray-600 text-white rounded text-xs">
                            {reward.rewardType}
                          </span>
                        </td>
                        <td className="p-3">
                          <input
                            type="radio"
                            name="reward"
                            checked={selectedId === reward.rewardId}
                            onChange={() => setSelectedId(reward.rewardId)}
                            className="cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="plain" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSelect}>선택하기</Button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default RewardSelectModal;
