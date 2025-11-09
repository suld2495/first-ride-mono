import { Quest } from '@repo/types';
import { IconAward } from '@tabler/icons-react';

import { COLOR } from '@/utils/color';

import Paragraph from '../common/paragraph/Paragraph';

type QuestRewards = Pick<Quest, 'rewardName' | 'rewardType'>;

const QuestRewards = ({ rewardName }: QuestRewards) => {
  return (
    <div className="bg-primary-reward-background-color border-primary-reward-border-color border-[1px] p-2 pb-3 rounded-md">
      <div className="flex items-center gap-1 mb-3 text-amber-400">
        <IconAward stroke={2} size={20} color={COLOR.reward.primaryText} />
        <Paragraph className="font-bold" color={COLOR.reward.primaryText}>
          REWARDS
        </Paragraph>
      </div>
      <Paragraph>{rewardName}</Paragraph>
    </div>
  );
};

export default QuestRewards;
