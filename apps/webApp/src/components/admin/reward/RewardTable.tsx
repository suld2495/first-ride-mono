import {
  formatRewardDate,
  getRewardTypeBadgeColor,
  truncateRewardName,
} from '@repo/shared/utils/reward-utils';
import { Reward } from '@repo/types';

import Button from '@/components/common/button/Button';
import Paragraph from '@/components/common/paragraph/Paragraph';

interface RewardTableProps {
  rewards: Reward[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: number) => void;
}

const RewardTable = ({
  rewards,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
}: RewardTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = rewards.slice(startIndex, startIndex + itemsPerPage);

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-main dark:text-gray-200">
        보상이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-[1px] border-gray-300 dark:border-gray-600">
            <th className="p-3 text-left text-gray-main dark:text-gray-200">
              <Paragraph>No</Paragraph>
            </th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200">
              <Paragraph>보상명</Paragraph>
            </th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200">
              <Paragraph>타입</Paragraph>
            </th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200">
              <Paragraph>경험치</Paragraph>
            </th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200">
              <Paragraph>생성일</Paragraph>
            </th>
            <th className="p-3 text-left text-gray-main dark:text-gray-200">
              <Paragraph>액션</Paragraph>
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
                <Paragraph>{startIndex + index + 1}</Paragraph>
              </td>
              <td
                className="p-3 text-gray-main dark:text-gray-200"
                title={reward.rewardName}
              >
                <Paragraph>
                  {truncateRewardName(reward.rewardName, 20)}
                </Paragraph>
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${getRewardTypeBadgeColor(reward.rewardType)}`}
                >
                  {reward.rewardType}
                </span>
              </td>
              <td className="p-3 text-gray-main dark:text-gray-200">
                <Paragraph>{reward.expAmount}</Paragraph>
              </td>
              <td className="p-3 text-gray-main dark:text-gray-200">
                <Paragraph>{formatRewardDate(reward.createdAt)}</Paragraph>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button size="small" onClick={() => onEdit(reward)}>
                    수정
                  </Button>
                  <Button
                    size="small"
                    variant="plain"
                    onClick={() => onDelete(reward.rewardId)}
                  >
                    삭제
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardTable;
